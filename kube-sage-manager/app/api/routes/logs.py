from fastapi import APIRouter, Query

from app.collectors.loki_client import query_loki
from app.models.schemas import LogsResponse

router = APIRouter()


@router.get("/logs", response_model=LogsResponse)
async def get_logs(
    query: str = Query(..., description="LogQL query"),
    start: str | None = Query(None, description="Start timestamp"),
    end: str | None = Query(None, description="End timestamp"),
    limit: int = Query(100, ge=1, le=5000),
):
    entries = await query_loki(query=query, start=start, end=end, limit=limit)
    return LogsResponse(query=query, entries=entries)
