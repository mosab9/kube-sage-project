import httpx

from app.config import settings
from app.models.schemas import LogEntry


async def query_loki(
    query: str,
    start: str | None = None,
    end: str | None = None,
    limit: int = 100,
) -> list[LogEntry]:
    params: dict = {"query": query, "limit": limit}
    if start:
        params["start"] = start
    if end:
        params["end"] = end

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.get(
            f"{settings.loki_url}/loki/api/v1/query_range",
            params=params,
        )
        resp.raise_for_status()
        data = resp.json()

    entries: list[LogEntry] = []
    for stream in data.get("data", {}).get("result", []):
        labels = stream.get("stream", {})
        for ts, line in stream.get("values", []):
            entries.append(LogEntry(timestamp=ts, line=line, labels=labels))
    return entries
