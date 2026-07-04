"""Find.ai Backend — News + Course Content (FastAPI entry point)."""
from __future__ import annotations

import asyncio
import logging
import time

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from core import registry
from core.enricher import enrich_article
from core.mapper import load_concepts, map_to_concept
from models.schemas import (
    CategoriesResponse,
    ErrorResponse,
    NewsArticle,
    NewsFeedResponse,
)
from middleware.auth_gateway import AuthGatewayMiddleware
from routes.courses import router as courses_router
from routes.admin import router as admin_router
from routes.me import router as me_router

logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] [%(levelname)s] [%(name)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("find-ai-backend")

# Each page shifts the fetch window one day into the past; cap how far back
# infinite scroll can go.
MAX_PAGES = 30

# Fail fast at import time if config or handlers are broken.
registry.load_config()
registry.validate_handlers()
load_concepts()

app = FastAPI(title="Find.ai API", version="2.3.0")
# Gateway auth: every request is authenticated before reaching any route
# handler (see middleware/auth_gateway.py). CORS is added second so it wraps
# the gateway and still decorates 401 responses.
app.add_middleware(AuthGatewayMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(courses_router)
app.include_router(admin_router)
app.include_router(me_router)


async def _fetch_category(category: str, page: int) -> "tuple[str, list[NewsArticle]]":
    """Fetch one page of one category; returns ("ok" | "error", articles)."""
    start = time.perf_counter()
    handler, feed = registry.get_handler(category)
    try:
        raw_articles = await handler(
            url=feed["url"],
            params=feed.get("params") or {},
            max_articles=feed.get("max_articles", 20),
            trusted_domains=feed.get("trusted_domains") or [],
            page=page,
        )
    except Exception:
        logger.exception("Handler '%s' crashed for category '%s'", feed["handler"], category)
        return "error", []

    articles = []
    for raw in raw_articles:
        concept_id, concept_title = map_to_concept(raw.title, raw.description)
        articles.append(enrich_article(raw, concept_id, concept_title))

    elapsed_ms = (time.perf_counter() - start) * 1000
    logger.info(
        "category=%s handler=%s page=%d articles=%d time=%.0fms",
        category, feed["handler"], page, len(articles), elapsed_ms,
    )
    return "ok", articles


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/api/v1/categories", response_model=CategoriesResponse)
async def get_categories():
    return CategoriesResponse(categories=registry.list_categories())


@app.get("/api/v1/news", response_model=NewsFeedResponse)
async def get_all_news(
    page: int = Query(1, ge=1, le=MAX_PAGES),
    limit: int = Query(20, ge=1, le=100),
):
    categories = [c["id"] for c in registry.list_categories()]
    results = await asyncio.gather(*[_fetch_category(c, page) for c in categories])

    # Dedupe by article id (hash of URL), keeping first occurrence
    combined = list({a.id: a for _, articles in results for a in articles}.values())
    combined.sort(key=lambda a: a.published_at, reverse=True)
    combined = combined[:limit]

    status = "ok" if any(s == "ok" for s, _ in results) else "error"
    return NewsFeedResponse(
        status=status,
        category="all",
        category_name="All News",
        count=len(combined),
        page=page,
        has_more=page < MAX_PAGES and len(combined) > 0,
        articles=combined,
    )


@app.get("/api/v1/news/{category}", response_model=NewsFeedResponse)
async def get_news(
    category: str,
    page: int = Query(1, ge=1, le=MAX_PAGES),
    limit: int = Query(20, ge=1, le=100),
):
    try:
        _, feed = registry.get_handler(category)
    except KeyError:
        available = ", ".join(c["id"] for c in registry.list_categories())
        return JSONResponse(
            status_code=404,
            content=ErrorResponse(
                status="error",
                detail=f"Category '{category}' not found. Available: {available}",
            ).model_dump(),
        )

    status, articles = await _fetch_category(category, page)
    articles.sort(key=lambda a: a.published_at, reverse=True)
    articles = articles[:limit]
    return NewsFeedResponse(
        status=status,
        category=category,
        category_name=feed["name"],
        count=len(articles),
        page=page,
        has_more=page < MAX_PAGES and len(articles) > 0,
        articles=articles,
    )
