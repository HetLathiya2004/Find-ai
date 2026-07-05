"""MoneyControl HTML scraper handler.

Scrapes article listings from moneycontrol.com/news/{category}/.
Same interface as google_news and generic_rss: async fetch_and_parse().
"""
from __future__ import annotations

import logging
import re
from datetime import datetime, timezone

from bs4 import BeautifulSoup
from curl_cffi import AsyncSession

from models.schemas import RawArticle

logger = logging.getLogger(__name__)

_ARTICLE_ID_RE = re.compile(r"-(\d+)\.html$")


async def fetch_and_parse(
    url: str,
    params: dict,
    max_articles: int,
    trusted_domains: list[str],
    page: int = 1,
) -> list[RawArticle]:
    """Scrape MoneyControl news listing page for article links."""
    try:
        async with AsyncSession() as session:
            response = await session.get(url, params=params, impersonate="chrome")
        if response.status_code != 200:
            logger.error("MoneyControl returned HTTP %s for %s", response.status_code, url)
            return []

        soup = BeautifulSoup(response.text, "html.parser")
        now_iso = datetime.now(timezone.utc).isoformat()

        articles: list[RawArticle] = []
        seen: set[str] = set()

        for a in soup.find_all("a", href=True):
            href = a["href"]
            text = a.get_text(strip=True)
            if not text or len(text) < 25 or ".html" not in href:
                continue
            if "/news/" not in href or "tags/" in href:
                continue

            match = _ARTICLE_ID_RE.search(href)
            if not match or match.group(1) in seen:
                continue
            seen.add(match.group(1))

            link = href if href.startswith("http") else f"https://www.moneycontrol.com{href}"

            articles.append(
                RawArticle(
                    title=text,
                    description=text,
                    source_name="Moneycontrol",
                    source_url="https://www.moneycontrol.com",
                    link=link,
                    published_at=now_iso,
                )
            )
            if len(articles) >= max_articles:
                break

        logger.info("moneycontrol handler: %d articles from %s", len(articles), url)
        return articles
    except Exception:
        logger.exception("moneycontrol handler failed for %s", url)
        return []
