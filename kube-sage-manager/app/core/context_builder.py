import json
import logging

from app.collectors.loki_client import query_loki
from app.collectors.elasticsearch_client import query_elasticsearch
from app.collectors.prometheus_client import query_prometheus
from app.collectors.k8s_client import get_events, get_pod_status
from app.config import settings
from app.core.event_watcher import get_recent_events

logger = logging.getLogger(__name__)


def _extract_message(raw_line: str) -> str:
    """Extract the human-readable message from nested Fluent Bit JSON logs."""
    try:
        parsed = json.loads(raw_line)
        level = parsed.get("level", "")
        message = parsed.get("message", "")
        logger_name = parsed.get("logger_name", "")
        timestamp = parsed.get("@timestamp", "")
        if message:
            return f"[{timestamp}] {level} {logger_name} - {message}"
    except (json.JSONDecodeError, TypeError):
        pass
    return raw_line


async def build_context(namespace: str, pod: str, timeframe: str) -> str:
    sections: list[str] = []

    # Pod status
    try:
        status = get_pod_status(namespace, pod)
        sections.append(f"## Pod Status\n{status}")
    except Exception as e:
        logger.warning("Failed to get pod status: %s", e)

    # Logs from Loki — query by app label
    try:
        logs = await query_loki(
            query=f'{{app="{pod}"}}',
            limit=50,
        )
        log_lines = "\n".join(_extract_message(entry.line) for entry in logs[-50:])
        sections.append(f"## Recent Logs (last {timeframe})\n{log_lines or 'No logs found'}")
    except Exception as e:
        logger.warning("Failed to query Loki: %s", e)

    # Logs from Elasticsearch (ELK)
    if settings.elasticsearch_enabled:
        try:
            es_logs = await query_elasticsearch(
                index="logs-*",
                query_str=pod,
                limit=50,
            )
            es_lines = "\n".join(_extract_message(entry.line) for entry in es_logs[-50:])
            sections.append(f"## Logs from Elasticsearch (ELK)\n{es_lines or 'No logs found'}")
        except Exception as e:
            logger.warning("Failed to query Elasticsearch: %s", e)

    # Metrics from Prometheus
    for metric_name, promql in [
        ("CPU Usage", f'rate(container_cpu_usage_seconds_total{{namespace="{namespace}", pod=~"{pod}.*"}}[5m])'),
        ("Memory Usage", f'container_memory_usage_bytes{{namespace="{namespace}", pod=~"{pod}.*"}}'),
        ("Restarts", f'kube_pod_container_status_restarts_total{{namespace="{namespace}", pod=~"{pod}.*"}}'),
    ]:
        try:
            results = await query_prometheus(query=promql)
            if results:
                latest = results[0].values[-1].value if results[0].values else "N/A"
                sections.append(f"## {metric_name}\nLatest value: {latest}")
        except Exception as e:
            logger.warning("Failed to query Prometheus for %s: %s", metric_name, e)

    # K8s events — prefer watch buffer, fall back to API list
    pod_events = [e for e in get_recent_events(namespace) if pod in e.involved_object]
    if not pod_events:
        try:
            all_events = get_events(namespace)
            pod_events = [e for e in all_events if pod in e.involved_object]
        except Exception as e:
            logger.warning("Failed to get K8s events: %s", e)
    if pod_events:
        event_lines = "\n".join(
            f"[{e.type}] {e.reason}: {e.message}" for e in pod_events[:20]
        )
        sections.append(f"## Kubernetes Events\n{event_lines}")

    return "\n\n".join(sections)
