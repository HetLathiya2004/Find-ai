"""Manage multiple CloakBrowser tabs inside a single Chrome window."""
from __future__ import annotations

import logging
import time
from dataclasses import dataclass

from cloakbrowser import launch

logger = logging.getLogger(__name__)

DEFAULT_MAX_TABS = 5
DEFAULT_SETTLE_SECONDS = 2
DEFAULT_GOTO_TIMEOUT_MS = 60_000


@dataclass
class ScrapeResult:
    url: str
    ok: bool
    final_url: str = ""
    html: str = ""
    error: str = ""


def _scroll_page(page, steps: int = 6, pause: float = 0.35) -> None:
    """Scroll down the page so lazy-loaded content can render."""
    for i in range(steps):
        page.evaluate(
            f"window.scrollTo(0, Math.floor(document.body.scrollHeight * {(i + 1) / steps}));"
        )
        time.sleep(pause)
    page.evaluate("window.scrollTo(0, 0)")
    time.sleep(0.2)


class TabManager:
    """One Chrome window; up to `max_tabs` tabs via a single BrowserContext."""

    def __init__(
        self,
        *,
        headless: bool = False,
        max_tabs: int = DEFAULT_MAX_TABS,
        settle_seconds: float = DEFAULT_SETTLE_SECONDS,
        goto_timeout_ms: int = DEFAULT_GOTO_TIMEOUT_MS,
    ) -> None:
        if max_tabs < 1:
            raise ValueError("max_tabs must be >= 1")
        self.headless = headless
        self.max_tabs = max_tabs
        self.settle_seconds = settle_seconds
        self.goto_timeout_ms = goto_timeout_ms
        self._browser = None
        self._context = None

    def __enter__(self) -> "TabManager":
        # One browser + one context = one window; context.new_page() = new tab
        self._browser = launch(headless=self.headless)
        self._context = self._browser.new_context()
        return self

    def __exit__(self, *_) -> None:
        if self._context is not None:
            self._context.close()
            self._context = None
        if self._browser is not None:
            self._browser.close()
            self._browser = None

    def scrape_urls(self, urls: list[str]) -> list[ScrapeResult]:
        if self._context is None:
            raise RuntimeError("TabManager must be used as a context manager")

        results: list[ScrapeResult] = []
        for i in range(0, len(urls), self.max_tabs):
            batch = urls[i : i + self.max_tabs]
            results.extend(self._scrape_batch(batch))
        return results

    def _scrape_batch(self, urls: list[str]) -> list[ScrapeResult]:
        """Open tabs in the same window, then settle / scroll / capture each."""
        context = self._context
        assert context is not None

        pages: list[tuple[str, object]] = []
        open_errors: dict[str, ScrapeResult] = {}

        # Open all tabs in this single context (same Chrome window)
        for url in urls:
            try:
                page = context.new_page()
                pages.append((url, page))
                print(f"  tab opened ({len(pages)}): {url}")
            except Exception as exc:
                open_errors[url] = ScrapeResult(
                    url=url, ok=False, error=f"{type(exc).__name__}: {exc}"
                )

        # Navigate every tab
        for url, page in pages:
            try:
                print(f"  navigating: {url}")
                page.goto(url, wait_until="load", timeout=self.goto_timeout_ms)
            except Exception as exc:
                open_errors[url] = ScrapeResult(
                    url=url, ok=False, error=f"{type(exc).__name__}: {exc}"
                )

        results: list[ScrapeResult] = []
        for url, page in pages:
            if url in open_errors:
                results.append(open_errors[url])
                page.close()
                continue
            try:
                try:
                    page.wait_for_load_state("networkidle", timeout=15_000)
                except Exception:
                    # TOI-style pages often never go fully idle (ads/analytics).
                    page.wait_for_load_state("load", timeout=10_000)
                print(f"  settle {self.settle_seconds}s + scroll: {url}")
                time.sleep(self.settle_seconds)
                _scroll_page(page)
                time.sleep(self.settle_seconds)
                results.append(
                    ScrapeResult(
                        url=url,
                        ok=True,
                        final_url=page.url,
                        html=page.content(),
                    )
                )
            except Exception as exc:
                results.append(
                    ScrapeResult(url=url, ok=False, error=f"{type(exc).__name__}: {exc}")
                )
            finally:
                page.close()

        for url, err in open_errors.items():
            if all(r.url != url for r in results):
                results.append(err)

        return results
