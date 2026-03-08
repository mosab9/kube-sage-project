import asyncio
import json

from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect

from app.collectors.k8s_client import get_events
from app.core.event_watcher import get_recent_events, subscribe, unsubscribe
from app.models.schemas import EventsResponse

router = APIRouter()


@router.get("/events", response_model=EventsResponse)
async def list_events(
    namespace: str = Query("default", description="Kubernetes namespace"),
):
    events = get_events(namespace=namespace)
    return EventsResponse(namespace=namespace, events=events)


@router.websocket("/ws/events")
async def websocket_events(ws: WebSocket, namespace: str = ""):
    """Stream K8s events in real-time via WebSocket."""
    await ws.accept()
    q = subscribe()
    try:
        while True:
            event_type, k8s_event = await q.get()
            if namespace and k8s_event.namespace != namespace:
                continue
            await ws.send_text(json.dumps({
                "event_type": event_type,
                "event": k8s_event.model_dump(),
            }))
    except (WebSocketDisconnect, asyncio.CancelledError):
        pass
    finally:
        unsubscribe(q)
