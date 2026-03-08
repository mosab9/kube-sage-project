from datetime import datetime
from threading import Lock

from app.models.schemas import MetricsHistoryEntry, RemediationStep


class MetricsStore:
    """In-memory store for diagnosis performance metrics history."""

    def __init__(self, max_entries: int = 100):
        self._entries: list[MetricsHistoryEntry] = []
        self._lock = Lock()
        self._counter = 0
        self._max_entries = max_entries

    def add(
        self,
        namespace: str,
        pod: str,
        model: str,
        latency_ms: float,
        tokens_generated: int | None = None,
        tokens_per_second: float | None = None,
        accuracy: float | None = None,
        explanation_quality: float | None = None,
        root_cause: str | None = None,
        explanation: str | None = None,
        severity: str | None = None,
        evidence: list[str] | None = None,
        remediation_steps: list[RemediationStep] | None = None,
    ) -> MetricsHistoryEntry:
        with self._lock:
            self._counter += 1
            entry = MetricsHistoryEntry(
                id=self._counter,
                timestamp=datetime.now(),
                namespace=namespace,
                pod=pod,
                model=model,
                latency_ms=latency_ms,
                tokens_generated=tokens_generated,
                tokens_per_second=tokens_per_second,
                accuracy=accuracy,
                explanation_quality=explanation_quality,
                root_cause=root_cause,
                explanation=explanation,
                severity=severity,
                evidence=evidence,
                remediation_steps=remediation_steps,
            )
            self._entries.append(entry)
            if len(self._entries) > self._max_entries:
                self._entries.pop(0)
            return entry

    def get_all(self) -> list[MetricsHistoryEntry]:
        with self._lock:
            return list(reversed(self._entries))

    def clear(self) -> None:
        with self._lock:
            self._entries.clear()
            self._counter = 0


metrics_store = MetricsStore()
