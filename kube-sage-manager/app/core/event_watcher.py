import asyncio
import logging
from collections import deque

from app.collectors.k8s_client import watch_events
from app.models.schemas import K8sEvent

logger = logging.getLogger(__name__)

# In-memory ring buffer of recent events
_recent_events: deque[tuple[str, K8sEvent]] = deque(maxlen=500)

# Connected WebSocket subscribers
_subscribers: set[asyncio.Queue[tuple[str, K8sEvent]]] = set()


def get_recent_events(namespace: str = "") -> list[K8sEvent]:
    """Return recent events from the buffer, optionally filtered by namespace."""
    return [
        ev for _, ev in _recent_events
        if not namespace or ev.namespace == namespace
    ]


def subscribe() -> asyncio.Queue[tuple[str, K8sEvent]]:
    q: asyncio.Queue[tuple[str, K8sEvent]] = asyncio.Queue()
    _subscribers.add(q)
    return q


def unsubscribe(q: asyncio.Queue) -> None:
    _subscribers.discard(q)


async def _run_watcher(namespace: str) -> None:
    """Run the blocking K8s watch in a thread and broadcast events."""
    loop = asyncio.get_event_loop()
    retry_delay = 5

    def _blocking_watch():
        try:
            for event_type, k8s_event in watch_events(namespace=namespace):
                _recent_events.append((event_type, k8s_event))
                for q in list(_subscribers):
                    try:
                        q.put_nowait((event_type, k8s_event))
                    except asyncio.QueueFull:
                        pass
        except Exception as e:
            logger.error("K8s watch error: %s", e)
            raise

    while True:
        logger.info("Starting K8s event watcher (namespace=%s)", namespace or "all")
        try:
            await loop.run_in_executor(None, _blocking_watch)
        except Exception as e:
            logger.warning("K8s watcher failed: %s. Retrying in %ds...", e, retry_delay)
        await asyncio.sleep(retry_delay)


_watcher_task: asyncio.Task | None = None


def start_watcher(namespace: str = "") -> None:
    global _watcher_task
    if _watcher_task is None or _watcher_task.done():
        _watcher_task = asyncio.create_task(_run_watcher(namespace))
        logger.info("K8s event watcher task started")


def stop_watcher() -> None:
    global _watcher_task
    if _watcher_task and not _watcher_task.done():
        _watcher_task.cancel()
        _watcher_task = None
        logger.info("K8s event watcher task stopped")
