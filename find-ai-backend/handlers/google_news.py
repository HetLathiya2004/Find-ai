"""Google News RSS handler.

Pure function: URL in → RawArticle list out. No FastAPI/core imports.
"""

import html
import logging
import re
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
from urllib.parse import urlparse

from curl_cffi import AsyncSession

from models.schemas import RawArticle

logger = logging.getLogger(__name__)

_TAG_RE = re.compile(r"<[^>]+>")


def _strip_html(text: str) -> str:
    return html.unescape(_TAG_RE.sub(" ", text or "")).strip()


def _to_iso_date(raw_date: str) -> str:
    """Convert RFC 2822 or ISO 8601 date strings to YYYY-MM-DD."""
    for parser in (parsedate_to_datetime, datetime.fromisoformat):
        try:
            return parser(raw_date.strip()).strftime("%Y-%m-%d")
        except (ValueError, TypeError):
            continue
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


def _is_trusted(source_url: str, trusted_domains: list[str]) -> bool:
    if not trusted_domains:
        return True
    host = urlparse(source_url).netloc.lower().removeprefix("www.")
    return any(host == d or host.endswith("." + d) for d in trusted_domains)


async def fetch_and_parse(
    url: str,
    params: dict,
    max_articles: int,
    trusted_domains: list[str],
) -> list[RawArticle]:
    """Fetch a Google News RSS search feed and parse its items."""
    try:
        # Restrict the search to roughly the last 24 hours.
        now = datetime.now(timezone.utc)
        yesterday = (now - timedelta(days=1)).strftime("%Y-%m-%d")
        tomorrow = (now + timedelta(days=1)).strftime("%Y-%m-%d")
        params = dict(params)
        params["q"] = f"{params.get('q', '')} after:{yesterday} before:{tomorrow}".strip()

        async with AsyncSession() as session:
            response = await session.get(url, params=params, impersonate="chrome")
        if response.status_code != 200:
            logger.error("Google News returned HTTP %s for %s", response.status_code, url)
            return []

        root = ET.fromstring(response.text)
        articles: list[RawArticle] = []
        seen_links: set[str] = set()

        for item in root.iter("item"):
            link = (item.findtext("link") or "").strip()
            title = _strip_html(item.findtext("title") or "")
            if not link or not title or link in seen_links:
                continue

            source_el = item.find("source")
            source_url = source_el.get("url", "") if source_el is not None else ""
            if not _is_trusted(source_url, trusted_domains):
                continue

            seen_links.add(link)
            articles.append(
                RawArticle(
                    title=title,
                    description=_strip_html(item.findtext("description") or ""),
                    source_name=(source_el.text or "").strip() if source_el is not None else "",
                    source_url=source_url,
                    link=link,
                    published_at=_to_iso_date(item.findtext("pubDate") or ""),
                )
            )
            if len(articles) >= max_articles:
                break

        return articles
    except Exception:
        logger.exception("google_news handler failed for %s", url)
        return []
