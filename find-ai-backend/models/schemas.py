"""Pydantic models for the Find.ai news API. Python 3.9 compatible."""
from __future__ import annotations

from typing import Optional

from pydantic import BaseModel


class RawArticle(BaseModel):
    """Internal model — output of handlers, input to enricher."""
    title: str
    description: str
    source_name: str
    source_url: str
    link: str
    published_at: str  # "YYYY-MM-DD"


class NewsArticle(BaseModel):
    """API response model — matches the app's MockNewsArticle interface."""
    id: str
    title: str
    summary: str
    why_it_matters: Optional[str]
    published_at: str
    concept_id: str
    concept_title: str
    xp_reward: int


class NewsFeedResponse(BaseModel):
    """Top-level API response."""
    status: str  # "ok" or "error"
    category: str
    category_name: str
    count: int
    page: int
    has_more: bool
    articles: list[NewsArticle]


class CategoriesResponse(BaseModel):
    """List of available categories."""
    categories: list[dict]


class ErrorResponse(BaseModel):
    status: str  # "error"
    detail: str
