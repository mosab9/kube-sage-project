import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import health, logs, es_logs, metrics, events, diagnose, chat, models, metrics_history
from app.config import settings
from app.core.event_watcher import start_watcher, stop_watcher

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(name)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    if settings.k8s_watcher_enabled:
        start_watcher()
    else:
        logger.info("K8s event watcher disabled via K8S_WATCHER_ENABLED=false")
    yield
    if settings.k8s_watcher_enabled:
        stop_watcher()


app = FastAPI(title="KubeSage Manager", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PREFIX = "/api/v1"
app.include_router(health.router, prefix=PREFIX, tags=["health"])
app.include_router(logs.router, prefix=PREFIX, tags=["logs"])
app.include_router(es_logs.router, prefix=PREFIX, tags=["es-logs"])
app.include_router(metrics.router, prefix=PREFIX, tags=["metrics"])
app.include_router(events.router, prefix=PREFIX, tags=["events"])
app.include_router(diagnose.router, prefix=PREFIX, tags=["diagnose"])
app.include_router(chat.router, prefix=PREFIX, tags=["chat"])
app.include_router(models.router, prefix=PREFIX, tags=["models"])
app.include_router(metrics_history.router, prefix=PREFIX, tags=["metrics-history"])
