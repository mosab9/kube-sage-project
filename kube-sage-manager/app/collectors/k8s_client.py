import logging
import os
from collections.abc import Generator

from kubernetes import client, config, watch

from app.models.schemas import K8sEvent

logger = logging.getLogger(__name__)


def _load_config() -> None:
    kubeconfig = os.environ.get("KUBECONFIG")
    if kubeconfig:
        config.load_kube_config(config_file=kubeconfig)
    else:
        try:
            config.load_incluster_config()
        except config.ConfigException:
            config.load_kube_config()


def get_events(namespace: str = "default") -> list[K8sEvent]:
    _load_config()
    v1 = client.CoreV1Api()
    events = v1.list_namespaced_event(namespace=namespace)
    result: list[K8sEvent] = []
    for e in events.items:
        obj = e.involved_object
        result.append(
            K8sEvent(
                namespace=namespace,
                name=e.metadata.name,
                reason=e.reason or "",
                message=e.message or "",
                type=e.type or "Normal",
                involved_object=f"{obj.kind}/{obj.name}" if obj else "",
                timestamp=e.last_timestamp.isoformat() if e.last_timestamp else None,
            )
        )
    return result


def get_pod_status(namespace: str, pod: str) -> dict:
    _load_config()
    v1 = client.CoreV1Api()
    p = v1.read_namespaced_pod(name=pod, namespace=namespace)
    containers = []
    for cs in (p.status.container_statuses or []):
        containers.append({
            "name": cs.name,
            "ready": cs.ready,
            "restart_count": cs.restart_count,
            "state": str(cs.state),
        })
    return {
        "name": p.metadata.name,
        "namespace": p.metadata.namespace,
        "phase": p.status.phase,
        "containers": containers,
    }


def watch_events(namespace: str = "", timeout: int = 0) -> Generator[tuple[str, K8sEvent], None, None]:
    """Watch K8s events and yield (event_type, K8sEvent) tuples.

    event_type is one of: ADDED, MODIFIED, DELETED.
    Set timeout=0 for indefinite watching.
    """
    _load_config()
    v1 = client.CoreV1Api()
    w = watch.Watch()

    kwargs: dict = {"timeout_seconds": timeout} if timeout > 0 else {}
    list_fn = v1.list_namespaced_event if namespace else v1.list_event_for_all_namespaces
    if namespace:
        kwargs["namespace"] = namespace

    for event in w.stream(list_fn, **kwargs):
        event_type: str = event["type"]
        e = event["object"]
        obj = e.involved_object
        k8s_event = K8sEvent(
            namespace=e.metadata.namespace or "",
            name=e.metadata.name,
            reason=e.reason or "",
            message=e.message or "",
            type=e.type or "Normal",
            involved_object=f"{obj.kind}/{obj.name}" if obj else "",
            timestamp=e.last_timestamp.isoformat() if e.last_timestamp else None,
        )
        yield event_type, k8s_event
