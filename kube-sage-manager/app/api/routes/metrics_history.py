from fastapi import APIRouter

from app.core.metrics_store import metrics_store
from app.models.schemas import MetricsHistoryResponse

router = APIRouter()


@router.get("/metrics-history", response_model=MetricsHistoryResponse)
async def get_metrics_history():
    entries = metrics_store.get_all()
    return MetricsHistoryResponse(entries=entries, total=len(entries))


@router.delete("/metrics-history")
async def clear_metrics_history():
    metrics_store.clear()
    return {"status": "cleared"}
