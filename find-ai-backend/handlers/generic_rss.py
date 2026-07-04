"""Generic RSS 2.0 / Atom handler (for standard feeds).

Pure function: URL in → RawArticle list out. No FastAPI/core imports.
Python 3.9 compatible.
"""
from __future__ import annotations

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
_ATOM_NS = "{http://www.w3.org/2005/Atom}"


def _strip_html(text: str) -> str:
    return html.unescape(_TAG_RE.sub(" ", text or "")).strip()


def _to_iso_date(raw_date: str) -> str:
    for parser in (parsedate_to_datetime, datetime.fromisoformat):
        try:
            return parser(raw_date.strip().replace("Z", "+00:00")).strftime("%Y-%m-%d")
        except (ValueError, TypeError):
            continue
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


def _date_window(page: int) -> "tuple[str, str]":
    """Same paging scheme as google_news: 1-day windows shifted into the past."""
    now = datetime.now(timezone.utc)
    offset = max(page - 1, 0)
    after = (now - timedelta(days=1 + offset)).strftime("%Y-%m-%d")
    before = (now + timedelta(days=1 - offset)).strftime("%Y-%m-%d")
    return after, before


def _extract_items(root: ET.Element) -> "list[tuple[str, str, str, str]]":
    """Yield (title, link, description, date) from RSS <item> or Atom <entry>."""
    items = []
    for item in root.iter("item"):  # RSS 2.0
        items.append((
            item.findtext("title") or "",
            (item.findtext("link") or "").strip(),
            item.findtext("description") or "",
            item.findtext("pubDate") or "",
        ))
    for entry in root.iter(f"{_ATOM_NS}entry"):  # Atom
        link_el = entry.find(f"{_ATOM_NS}link")
        items.append((
            entry.findtext(f"{_ATOM_NS}title") or "",
            link_el.get("href", "").strip() if link_el is not None else "",
            entry.findtext(f"{_ATOM_NS}summary") or "",
            entry.findtext(f"{_ATOM_NS}published") or "",
        ))
    return items


async def fetch_and_parse(
    url: str,
    params: dict,
    max_articles: int,
    trusted_domains: list[str],
    page: int = 1,
) -> list[RawArticle]:
    """Fetch a standard RSS/Atom feed, keeping items inside the page's date window."""
    try:
        async with AsyncSession() as session:
            response = await session.get(url, params=params, impersonate="chrome")
        if response.status_code != 200:
            logger.error("Feed returned HTTP %s for %s", response.status_code, url)
            return []

        after, before = _date_window(page)
        feed_host = urlparse(url).netloc
        articles: list[RawArticle] = []
        seen_links: set[str] = set()

        for raw_title, link, raw_desc, raw_date in _extract_items(ET.fromstring(response.text)):
            title = _strip_html(raw_title)
            if not link or not title or link in seen_links:
                continue
            published_at = _to_iso_date(raw_date)
            # ISO dates compare correctly as strings; upper bound exclusive,
            # matching Google News "before:" semantics
            if not (after <= published_at < before):
                continue
            seen_links.add(link)
            articles.append(
                RawArticle(
                    title=title,
                    description=_strip_html(raw_desc),
                    source_name=feed_host,
                    source_url=f"https://{feed_host}",
                    link=link,
                    published_at=published_at,
                )
            )
            if len(articles) >= max_articles:
                break

        return articles
    except Exception:
        logger.exception("generic_rss handler failed for %s", url)
        return []
