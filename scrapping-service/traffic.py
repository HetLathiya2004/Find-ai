"""In-memory traffic log — incoming API requests + outgoing scrape navigations."""
from __future__ import annotations

import threading
import time
from collections import deque
from dataclasses import asdict, dataclass, field
from typing import Any, Literal

Direction = Literal["in", "out"]

_MAX_EVENTS = 500
_lock = threading.Lock()
_events: deque[dict[str, Any]] = deque(maxlen=_MAX_EVENTS)


@dataclass
class TrafficEvent:
    direction: Direction  # in = client→service, out = service→target site
    method: str = ""
    path: str = ""
    url: str = ""
    status: int | None = None
    ok: bool | None = None
    client: str = ""
    duration_ms: float | None = None
    detail: str = ""
    ts: float = field(default_factory=time.time)

    def to_dict(self) -> dict[str, Any]:
        d = asdict(self)
        d["iso"] = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(self.ts))
        return d


def record(event: TrafficEvent) -> None:
    with _lock:
        _events.appendleft(event.to_dict())


def recent(limit: int = 100, direction: Direction | None = None) -> list[dict[str, Any]]:
    with _lock:
        items = list(_events)
    if direction:
        items = [e for e in items if e.get("direction") == direction]
    return items[:limit]


def stats() -> dict[str, Any]:
    with _lock:
        items = list(_events)
    incoming = [e for e in items if e.get("direction") == "in"]
    outgoing = [e for e in items if e.get("direction") == "out"]
    return {
        "total": len(items),
        "incoming": len(incoming),
        "outgoing": len(outgoing),
        "cap": _MAX_EVENTS,
    }
