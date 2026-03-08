import httpx

from app.config import settings
from app.models.schemas import LogEntry


async def query_elasticsearch(
    index: str = "logs-*",
    query_str: str = "*",
    start: str | None = None,
    end: str | None = None,
    limit: int = 50,
) -> list[LogEntry]:
    body: dict = {
        "size": limit,
        "sort": [{"@timestamp": {"order": "desc"}}],
        "query": {
            "bool": {
                "must": [{"query_string": {"query": query_str}}],
            }
        },
    }

    if start or end:
        ts_range: dict = {}
        if start:
            ts_range["gte"] = start
        if end:
            ts_range["lte"] = end
        body["query"]["bool"]["filter"] = [{"range": {"@timestamp": ts_range}}]

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            f"{settings.elasticsearch_url}/{index}/_search",
            json=body,
        )
        resp.raise_for_status()
        data = resp.json()

    entries: list[LogEntry] = []
    for hit in data.get("hits", {}).get("hits", []):
        source = hit.get("_source", {})
        timestamp = source.get("@timestamp", "")
        message = source.get("message", "")
        k8s = source.get("kubernetes", {})
        labels = {
            k: v for k, v in {
                "namespace": k8s.get("namespace_name", ""),
                "pod": k8s.get("pod_name", ""),
                "container": k8s.get("container_name", ""),
            }.items() if v
        }
        entries.append(LogEntry(timestamp=timestamp, line=message, labels=labels))
    return entries
