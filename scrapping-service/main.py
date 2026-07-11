"""Scraping service — one job: return fully loaded page HTML."""
from __future__ import annotations

import logging
import os
import time
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, Header, HTTPException, Request
from fastapi.responses import HTMLResponse, JSONResponse
from pydantic import BaseModel, Field, HttpUrl

import traffic
from otel_setup import get_tracer, setup_otel
from scraper import scrape_urls

logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] [%(levelname)s] [%(name)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("scrapping-service")

API_KEY = os.getenv("SCRAPE_API_KEY", "")
MAX_URLS = int(os.getenv("SCRAPE_MAX_URLS", "5"))


class AccessLogMiddleware:
    """Pure ASGI middleware — BaseHTTPMiddleware breaks OpenTelemetry spans."""

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        path = scope.get("path", "")
        if path == "/traffic/events":
            await self.app(scope, receive, send)
            return

        method = scope.get("method", "")
        client = ""
        if scope.get("client"):
            client = scope["client"][0]

        status_code = 500
        t0 = time.perf_counter()

        async def send_wrapper(message):
            nonlocal status_code
            if message["type"] == "http.response.start":
                status_code = message["status"]
            await send(message)

        try:
            await self.app(scope, receive, send_wrapper)
        finally:
            duration_ms = (time.perf_counter() - t0) * 1000
            traffic.record(
                traffic.TrafficEvent(
                    direction="in",
                    method=method,
                    path=path,
                    status=status_code,
                    client=client,
                    duration_ms=round(duration_ms, 1),
                )
            )
            logger.info(
                "IN  %s %s → %s (%.0fms) client=%s",
                method,
                path,
                status_code,
                duration_ms,
                client,
            )


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(
        "scrapping-service starting (headless=%s, api_key=%s)",
        os.getenv("SCRAPE_HEADLESS", "true"),
        "set" if API_KEY else "disabled",
    )
    yield
    logger.info("scrapping-service stopped")


app = FastAPI(title="Scraping Service", version="0.1.0", lifespan=lifespan)
# OTEL first, then access log (ASGI). Order matters for instrumentation.
setup_otel(app)
app.add_middleware(AccessLogMiddleware)



class ScrapeRequest(BaseModel):
    url: HttpUrl | None = None
    urls: list[HttpUrl] = Field(default_factory=list)


class ScrapeItem(BaseModel):
    ok: bool
    url: str
    final_url: str = ""
    html: str = ""
    error: str = ""


class ScrapeResponse(BaseModel):
    ok: bool
    results: list[ScrapeItem]


def _check_api_key(x_api_key: str | None) -> None:
    if not API_KEY:
        return
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid or missing X-API-Key")


@app.get("/health")
def health() -> dict[str, Any]:
    return {"ok": True, "service": "scrapping-service", "status": "up"}


@app.get("/traffic/events")
def traffic_events(limit: int = 100, direction: str | None = None) -> JSONResponse:
    """JSON feed of recent in/out traffic (for the live dashboard)."""
    d = direction if direction in ("in", "out") else None
    return JSONResponse(
        {
            "stats": traffic.stats(),
            "events": traffic.recent(limit=min(limit, 500), direction=d),  # type: ignore[arg-type]
        }
    )


@app.get("/traffic", response_class=HTMLResponse)
def traffic_page() -> str:
    """Live dashboard: incoming API calls + outgoing scrape navigations."""
    return _TRAFFIC_HTML


@app.post("/scrape", response_model=ScrapeResponse)
def scrape(
    body: ScrapeRequest,
    x_api_key: str | None = Header(default=None, alias="X-API-Key"),
) -> ScrapeResponse:
    """Open URL(s) in CloakBrowser, wait for full load + settle + scroll, return HTML."""
    _check_api_key(x_api_key)

    urls: list[str] = []
    if body.url:
        urls.append(str(body.url))
    urls.extend(str(u) for u in body.urls)

    seen: set[str] = set()
    unique: list[str] = []
    for u in urls:
        if u not in seen:
            seen.add(u)
            unique.append(u)

    if not unique:
        raise HTTPException(status_code=400, detail="Provide url or urls")
    if len(unique) > MAX_URLS:
        raise HTTPException(status_code=400, detail=f"Max {MAX_URLS} urls per request")

    for u in unique:
        traffic.record(
            traffic.TrafficEvent(
                direction="out",
                method="GET",
                url=u,
                path="/scrape→browser",
                detail="queued",
            )
        )
        logger.info("OUT %s", u)

    tracer = get_tracer()
    t0 = time.perf_counter()
    with tracer.start_as_current_span("scrape.batch") as batch_span:
        batch_span.set_attribute("scrape.url_count", len(unique))
        batch_span.set_attribute("scrape.urls", ",".join(unique)[:2000])
        raw = scrape_urls(unique, max_tabs=min(len(unique), MAX_URLS))
        batch_span.set_attribute("scrape.ok_count", sum(1 for r in raw if r.ok))
        batch_span.set_attribute("scrape.fail_count", sum(1 for r in raw if not r.ok))

        from opentelemetry.trace import Status, StatusCode

        for r in raw:
            with tracer.start_as_current_span("scrape.fetch") as fetch_span:
                fetch_span.set_attribute("http.url", r.url)
                fetch_span.set_attribute("scrape.final_url", r.final_url or "")
                fetch_span.set_attribute("scrape.ok", r.ok)
                fetch_span.set_attribute(
                    "scrape.html_bytes", len(r.html.encode("utf-8"))
                )
                if not r.ok:
                    fetch_span.set_attribute("scrape.error", (r.error or "")[:500])
                    fetch_span.set_status(Status(StatusCode.ERROR, (r.error or "fail")[:200]))

    duration_ms = (time.perf_counter() - t0) * 1000

    results = []
    for r in raw:
        traffic.record(
            traffic.TrafficEvent(
                direction="out",
                method="GET",
                url=r.final_url or r.url,
                path="/scrape→browser",
                ok=r.ok,
                status=200 if r.ok else 500,
                duration_ms=round(duration_ms / max(len(raw), 1), 1),
                detail=r.error or f"html_bytes={len(r.html.encode('utf-8'))}",
            )
        )
        results.append(
            ScrapeItem(
                ok=r.ok,
                url=r.url,
                final_url=r.final_url,
                html=r.html,
                error=r.error,
            )
        )

    return ScrapeResponse(ok=all(r.ok for r in results), results=results)


_TRAFFIC_HTML = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Scraping Service — Traffic</title>
<style>
  :root { --bg:#0b0b0b; --panel:#141414; --border:#2a2a2a; --text:#e8e8e8; --muted:#888;
          --in:#3b82f6; --out:#10b981; --bad:#ef4444; }
  * { box-sizing: border-box; }
  body { margin:0; font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
         background:var(--bg); color:var(--text); }
  header { padding:16px 20px; border-bottom:1px solid var(--border);
           display:flex; gap:16px; align-items:center; flex-wrap:wrap; }
  h1 { font-size:16px; margin:0; font-weight:600; }
  .stats { display:flex; gap:12px; flex-wrap:wrap; }
  .pill { background:var(--panel); border:1px solid var(--border); border-radius:6px;
          padding:6px 10px; font-size:12px; color:var(--muted); }
  .pill b { color:var(--text); }
  .filters button { background:var(--panel); color:var(--text); border:1px solid var(--border);
                    border-radius:6px; padding:6px 10px; cursor:pointer; font:inherit; font-size:12px; }
  .filters button.active { border-color:#fff; }
  table { width:100%; border-collapse:collapse; font-size:12px; }
  th, td { text-align:left; padding:8px 12px; border-bottom:1px solid var(--border); vertical-align:top; }
  th { color:var(--muted); font-weight:500; position:sticky; top:0; background:var(--bg); }
  .dir { font-weight:600; }
  .dir.in { color:var(--in); }
  .dir.out { color:var(--out); }
  .bad { color:var(--bad); }
  .ok { color:var(--out); }
  .url { word-break:break-all; color:var(--muted); max-width:520px; }
</style>
</head>
<body>
<header>
  <h1>Scraping Service Traffic</h1>
  <div class="stats" id="stats"></div>
  <div class="filters">
    <button class="active" data-d="">All</button>
    <button data-d="in">Incoming</button>
    <button data-d="out">Outgoing</button>
  </div>
</header>
<table>
  <thead>
    <tr>
      <th>Time</th><th>Dir</th><th>Method</th><th>Path / URL</th>
      <th>Status</th><th>ms</th><th>Client / Detail</th>
    </tr>
  </thead>
  <tbody id="rows"></tbody>
</table>
<script>
let direction = "";
document.querySelectorAll(".filters button").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".filters button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    direction = btn.dataset.d;
    refresh();
  };
});

async function refresh() {
  const q = direction ? `?direction=${direction}&limit=200` : "?limit=200";
  const res = await fetch("/traffic/events" + q);
  const data = await res.json();
  const s = data.stats;
  document.getElementById("stats").innerHTML = `
    <span class="pill">total <b>${s.total}</b></span>
    <span class="pill">incoming <b>${s.incoming}</b></span>
    <span class="pill">outgoing <b>${s.outgoing}</b></span>
  `;
  const rows = data.events.map(e => {
    const dir = e.direction === "in" ? "IN" : "OUT";
    const statusCls = (e.status && e.status >= 400) || e.ok === false ? "bad" : "ok";
    const target = e.direction === "out"
      ? `<div>${e.path || ""}</div><div class="url">${e.url || ""}</div>`
      : `<div>${e.method} ${e.path}</div>`;
    return `<tr>
      <td>${e.iso || ""}</td>
      <td class="dir ${e.direction}">${dir}</td>
      <td>${e.method || ""}</td>
      <td>${target}</td>
      <td class="${statusCls}">${e.status ?? (e.ok === false ? "fail" : e.ok === true ? "ok" : "")}</td>
      <td>${e.duration_ms ?? ""}</td>
      <td class="url">${e.client || ""} ${e.detail || ""}</td>
    </tr>`;
  }).join("");
  document.getElementById("rows").innerHTML = rows || `<tr><td colspan="7" style="color:#888">No traffic yet — hit /scrape or /health</td></tr>`;
}
refresh();
setInterval(refresh, 2000);
</script>
</body>
</html>
"""
