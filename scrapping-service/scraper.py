"""CloakBrowser scrape helpers — full page HTML only, no preprocessing."""
from __future__ import annotations

import logging
import os
from dataclasses import dataclass

from tab_manager import TabManager

logger = logging.getLogger(__name__)

SETTLE_SECONDS = float(os.getenv("SCRAPE_SETTLE_SECONDS", "2"))
GOTO_TIMEOUT_MS = int(os.getenv("SCRAPE_GOTO_TIMEOUT_MS", "60000"))
# Server deploys usually have no display — default headless True in production
HEADLESS = os.getenv("SCRAPE_HEADLESS", "true").lower() in ("1", "true", "yes")


@dataclass
class PageScrape:
    url: str
    ok: bool
    final_url: str = ""
    html: str = ""
    error: str = ""


def scrape_urls(urls: list[str], *, max_tabs: int = 5) -> list[PageScrape]:
    """Scrape one or more URLs in a single Chrome window (multiple tabs)."""
    with TabManager(
        headless=HEADLESS,
        max_tabs=max_tabs,
        settle_seconds=SETTLE_SECONDS,
        goto_timeout_ms=GOTO_TIMEOUT_MS,
    ) as tabs:
        results = tabs.scrape_urls(urls)
    return [
        PageScrape(
            url=r.url,
            ok=r.ok,
            final_url=r.final_url,
            html=r.html,
            error=r.error,
        )
        for r in results
    ]


def scrape_one(url: str) -> PageScrape:
    return scrape_urls([url], max_tabs=1)[0]
