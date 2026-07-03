"""Dummy enrichment — Phase 2.2 will replace this with LLM-generated content."""
from __future__ import annotations

import hashlib

from models.schemas import NewsArticle, RawArticle

XP_REWARD = 10


def enrich_article(raw: RawArticle, concept_id: str, concept_title: str) -> NewsArticle:
    """Convert a RawArticle into the final NewsArticle shape."""
    article_id = hashlib.sha256(raw.link.encode("utf-8")).hexdigest()[:16]
    return NewsArticle(
        id=article_id,
        title=raw.title,
        summary=raw.description,
        why_it_matters=None,  # Phase 2.2: LLM-generated
        published_at=raw.published_at,
        concept_id=concept_id,
        concept_title=concept_title,
        xp_reward=XP_REWARD,
    )
