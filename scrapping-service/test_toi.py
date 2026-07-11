"""Headed multi-tab CloakBrowser test — scroll + up to 5 pages at once."""
from __future__ import annotations

import sys
from pathlib import Path

from tab_manager import TabManager

OUT_DIR = Path(__file__).parent / "out"

# 5 finance / business pages for parallel tab scrape
URLS = [
    "https://timesofindia.indiatimes.com/business/startups",
    "https://timesofindia.indiatimes.com/business",
    "https://timesofindia.indiatimes.com/business/india-business",
    "https://timesofindia.indiatimes.com/business/international-business",
    "https://timesofindia.indiatimes.com/business/markets",
]


def main() -> int:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    print(f"Scraping {len(URLS)} pages (headed, max 5 tabs, settle+scroll)...")

    with TabManager(headless=False, max_tabs=5, settle_seconds=2) as tabs:
        results = tabs.scrape_urls(URLS)

    ok_count = 0
    for i, result in enumerate(results, start=1):
        if not result.ok:
            print(f"[{i}] FAIL  {result.url} — {result.error}")
            continue
        ok_count += 1
        path = OUT_DIR / f"tab_{i}.html"
        path.write_text(result.html, encoding="utf-8")
        print(
            f"[{i}] OK    {result.final_url} "
            f"({len(result.html.encode('utf-8'))} bytes) → {path.name}"
        )

    print(f"done: {ok_count}/{len(results)} ok")
    return 0 if ok_count == len(results) else 1


if __name__ == "__main__":
    raise SystemExit(main())
