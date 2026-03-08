from fastapi import APIRouter, Query

from app.collectors.prometheus_client import query_prometheus
from app.models.schemas import MetricsResponse

router = APIRouter()


@router.get("/metrics", response_model=MetricsResponse)
async def get_metrics(
    query: str = Query(..., description="PromQL query"),
    start: str | None = Query(None, description="Start timestamp"),
    end: str | None = Query(None, description="End timestamp"),
    step: str = Query("60", description="Step interval in seconds"),
):
    results = await query_prometheus(query=query, start=start, end=end, step=step)
    return MetricsResponse(query=query, results=results)
