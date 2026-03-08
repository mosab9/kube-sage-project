from fastapi import APIRouter, Query

from app.collectors.elasticsearch_client import query_elasticsearch
from app.models.schemas import LogsResponse

router = APIRouter()


@router.get("/es-logs", response_model=LogsResponse)
async def get_es_logs(
    q: str = Query("*", description="Elasticsearch query string"),
    index: str = Query("logs-*", description="Elasticsearch index pattern"),
    start: str | None = Query(None, description="Start timestamp"),
    end: str | None = Query(None, description="End timestamp"),
    limit: int = Query(100, ge=1, le=5000),
):
    entries = await query_elasticsearch(
        index=index, query_str=q, start=start, end=end, limit=limit,
    )
    return LogsResponse(query=q, entries=entries)
