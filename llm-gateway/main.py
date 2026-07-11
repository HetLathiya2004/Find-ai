"""OTLP-instrumented reverse proxy in front of llama.cpp.

Public :8080 → this gateway → llama on 127.0.0.1:18080
Traces every LLM request into SigNoz as service `llama-server`.
"""
from __future__ import annotations

import logging
import os
import time
from contextlib import asynccontextmanager

import httpx
from fastapi import FastAPI, Request, Response
from fastapi.responses import StreamingResponse

from otel_setup import setup_otel, get_tracer

logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] [%(levelname)s] [%(name)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("llama-gateway")

UPSTREAM = os.getenv("LLAMA_UPSTREAM", "http://127.0.0.1:18080").rstrip("/")
TIMEOUT = float(os.getenv("LLAMA_PROXY_TIMEOUT", "600"))

_client: httpx.AsyncClient | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _client
    _client = httpx.AsyncClient(
        base_url=UPSTREAM,
        timeout=httpx.Timeout(TIMEOUT, connect=10.0),
    )
    logger.info("llama-gateway → upstream %s", UPSTREAM)
    yield
    if _client is not None:
        await _client.aclose()
        _client = None


app = FastAPI(title="llama.cpp OTEL Gateway", version="0.1.0", lifespan=lifespan)
setup_otel(app)


@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"])
async def proxy(path: str, request: Request):
    assert _client is not None
    tracer = get_tracer("llama-gateway")
    query = request.url.query
    target = f"/{path}" + (f"?{query}" if query else "")

    body = await request.body()
    headers = {
        k: v
        for k, v in request.headers.items()
        if k.lower() not in ("host", "content-length", "transfer-encoding", "connection")
    }

    with tracer.start_as_current_span("llama.proxy") as span:
        span.set_attribute("http.method", request.method)
        span.set_attribute("http.route", f"/{path}")
        span.set_attribute("url.full", f"{UPSTREAM}{target}")
        span.set_attribute("peer.service", "llama.cpp")
        span.set_attribute("http.request_content_length", len(body))

        t0 = time.perf_counter()
        try:
            req = _client.build_request(
                request.method,
                target,
                headers=headers,
                content=body,
            )
            upstream = await _client.send(req, stream=True)
        except Exception as exc:
            span.set_attribute("error", True)
            span.set_attribute("llama.error", type(exc).__name__)
            logger.exception("upstream failed: %s %s", request.method, target)
            raise

        span.set_attribute("http.status_code", upstream.status_code)
        duration_ms = (time.perf_counter() - t0) * 1000
        # first-byte latency
        span.set_attribute("llama.ttfb_ms", round(duration_ms, 1))

        excluded = {
            "transfer-encoding",
            "connection",
            "content-encoding",
            "content-length",
        }
        out_headers = {
            k: v for k, v in upstream.headers.multi_items() if k.lower() not in excluded
        }

        async def stream():
            try:
                async for chunk in upstream.aiter_bytes():
                    yield chunk
            finally:
                await upstream.aclose()
                total_ms = (time.perf_counter() - t0) * 1000
                logger.info(
                    "%s /%s → %s (%.0fms)",
                    request.method,
                    path,
                    upstream.status_code,
                    total_ms,
                )

        return StreamingResponse(
            stream(),
            status_code=upstream.status_code,
            headers=out_headers,
            media_type=upstream.headers.get("content-type"),
        )


@app.get("/")
async def root():
    return {
        "ok": True,
        "service": "llama-gateway",
        "upstream": UPSTREAM,
        "note": "OTLP traces → SigNoz as service llama-server",
    }
