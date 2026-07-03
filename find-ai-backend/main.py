"""Find.ai News Backend — Phase 2.1.0 (FastAPI entry point)."""

import asyncio
import logging
import time

from fastapi import FastAPI
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

logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] [%(levelname)s] [%(name)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("find-ai-backend")

# Fail fast at import time if config or handlers are broken.
registry.load_config()
registry.validate_handlers()
load_concepts()

app = FastAPI(title="Find.ai News API", version="2.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


async def _fetch_category(category: str) -> tuple[str, list[NewsArticle]]:
    """Fetch one category and return ("ok" | "error", articles)."""
    start = time.perf_counter()
    handler, feed = registry.get_handler(category)
    try:
        raw_articles = await handler(
            url=feed["url"],
            params=feed.get("params") or {},
            max_articles=feed.get("max_articles", 20),
            trusted_domains=feed.get("trusted_domains") or [],
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
        "category=%s handler=%s articles=%d time=%.0fms",
        category, feed["handler"], len(articles), elapsed_ms,
    )
    return "ok", articles


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/api/v1/categories", response_model=CategoriesResponse)
async def get_categories():
    return CategoriesResponse(categories=registry.list_categories())


@app.get("/api/v1/news", response_model=NewsFeedResponse)
async def get_all_news():
    categories = [c["id"] for c in registry.list_categories()]
    results = await asyncio.gather(*[_fetch_category(c) for c in categories])

    # Dedupe by article id (hash of URL), keeping first occurrence
    combined = list({a.id: a for _, articles in results for a in articles}.values())
    combined.sort(key=lambda a: a.published_at, reverse=True)

    status = "ok" if any(s == "ok" for s, _ in results) else "error"
    return NewsFeedResponse(
        status=status,
        category="all",
        category_name="All News",
        count=len(combined),
        articles=combined,
    )


@app.get("/api/v1/news/{category}", response_model=NewsFeedResponse)
async def get_news(category: str):
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

    status, articles = await _fetch_category(category)
    articles.sort(key=lambda a: a.published_at, reverse=True)
    return NewsFeedResponse(
        status=status,
        category=category,
        category_name=feed["name"],
        count=len(articles),
        articles=articles,
    )
