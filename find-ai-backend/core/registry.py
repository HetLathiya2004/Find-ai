"""Handler registry — reads feeds.yaml and dispatches to handler modules."""

import importlib
import logging
from pathlib import Path
from typing import Callable

import yaml

logger = logging.getLogger(__name__)

FEEDS_PATH = Path(__file__).resolve().parent.parent / "config" / "feeds.yaml"

_config: dict | None = None


def load_config(force_reload: bool = False) -> dict:
    """Read feeds.yaml (cached after first load) and return the feeds dict."""
    global _config
    if _config is None or force_reload:
        if not FEEDS_PATH.exists():
            raise FileNotFoundError(f"Feed config not found: {FEEDS_PATH}")
        with open(FEEDS_PATH, encoding="utf-8") as f:
            _config = yaml.safe_load(f)["feeds"]
        logger.info("Loaded %d feeds from %s", len(_config), FEEDS_PATH)
    return _config


def validate_handlers() -> None:
    """Import every handler named in the config; fail loudly if one is missing."""
    for category, feed in load_config().items():
        module = importlib.import_module(f"handlers.{feed['handler']}")
        if not hasattr(module, feed["function"]):
            raise AttributeError(
                f"Handler 'handlers/{feed['handler']}.py' has no function "
                f"'{feed['function']}' (required by feed '{category}')"
            )


def get_handler(category: str) -> tuple[Callable, dict]:
    """Return (handler function, feed config) for a category.

    Raises KeyError if the category is not in feeds.yaml.
    """
    config = load_config()
    if category not in config:
        raise KeyError(category)
    feed = config[category]
    module = importlib.import_module(f"handlers.{feed['handler']}")
    return getattr(module, feed["function"]), feed


def list_categories() -> list[dict]:
    """Return all available categories with their display names."""
    return [{"id": key, "name": feed["name"]} for key, feed in load_config().items()]
