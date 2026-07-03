"""Keyword-based article → concept mapping."""
from __future__ import annotations

import logging
from pathlib import Path
from typing import Optional

import yaml

logger = logging.getLogger(__name__)

CONCEPTS_PATH = Path(__file__).resolve().parent.parent / "config" / "concepts.yaml"

_concepts: Optional[list] = None


def load_concepts() -> list[dict]:
    """Read concepts.yaml once and cache the concept catalog."""
    global _concepts
    if _concepts is None:
        if not CONCEPTS_PATH.exists():
            raise FileNotFoundError(f"Concept config not found: {CONCEPTS_PATH}")
        with open(CONCEPTS_PATH, encoding="utf-8") as f:
            _concepts = yaml.safe_load(f)["concepts"]
        logger.info("Loaded %d concepts from %s", len(_concepts), CONCEPTS_PATH)
    return _concepts


def map_to_concept(
    title: str,
    description: str,
    concepts: Optional[list] = None,
) -> tuple[str, str]:
    """Return (concept_id, concept_title) for an article.

    Longer keyword phrases are matched first and masked out of the text so
    shorter keywords cannot double-count inside an already-matched phrase.
    Highest hit count wins; ties go to the concept listed earlier in
    concepts.yaml. Zero hits everywhere falls back to c_default.
    """
    if concepts is None:
        concepts = load_concepts()

    text = f"{title} {description}".lower()

    # (keyword, concept index) pairs, longest keyword first
    indexed_keywords = [
        (kw.lower(), i)
        for i, concept in enumerate(concepts)
        for kw in concept.get("keywords") or []
    ]
    indexed_keywords.sort(key=lambda pair: len(pair[0]), reverse=True)

    hits = [0] * len(concepts)
    for keyword, idx in indexed_keywords:
        if keyword in text:
            hits[idx] += 1
            text = text.replace(keyword, " ")

    best_idx = max(range(len(concepts)), key=lambda i: hits[i])
    if hits[best_idx] == 0:
        fallback = next(
            (c for c in concepts if c["id"] == "c_default"), concepts[-1]
        )
        return fallback["id"], fallback["title"]

    return concepts[best_idx]["id"], concepts[best_idx]["title"]
