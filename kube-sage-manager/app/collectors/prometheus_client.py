import httpx

from app.config import settings
from app.models.schemas import MetricResult, MetricSample


async def query_prometheus(
    query: str,
    start: str | None = None,
    end: str | None = None,
    step: str = "60",
) -> list[MetricResult]:
    async with httpx.AsyncClient(timeout=30) as client:
        if start and end:
            resp = await client.get(
                f"{settings.prometheus_url}/api/v1/query_range",
                params={"query": query, "start": start, "end": end, "step": step},
            )
        else:
            resp = await client.get(
                f"{settings.prometheus_url}/api/v1/query",
                params={"query": query},
            )
        resp.raise_for_status()
        data = resp.json()

    results: list[MetricResult] = []
    for item in data.get("data", {}).get("result", []):
        metric = item.get("metric", {})
        raw_values = item.get("values") or [item.get("value", [])]
        values = [MetricSample(timestamp=v[0], value=v[1]) for v in raw_values if len(v) == 2]
        results.append(MetricResult(metric=metric, values=values))
    return results
