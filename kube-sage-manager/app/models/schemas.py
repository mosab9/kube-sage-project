from datetime import datetime
from pydantic import BaseModel


class OllamaModel(BaseModel):
    name: str
    size: int | None = None
    modified_at: str | None = None
    digest: str | None = None


class ModelsResponse(BaseModel):
    models: list[OllamaModel]


class ModelMetrics(BaseModel):
    model: str
    latency_ms: float
    tokens_generated: int | None = None
    tokens_per_second: float | None = None
    prompt_eval_count: int | None = None
    eval_count: int | None = None
    total_duration_ns: int | None = None
    load_duration_ns: int | None = None
    prompt_eval_duration_ns: int | None = None
    eval_duration_ns: int | None = None


class DiagnoseRequest(BaseModel):
    namespace: str = "default"
    pod: str
    timeframe: str = "1h"
    model: str | None = None


class RemediationStep(BaseModel):
    description: str
    command: str | None = None
    executable: bool = False


class Diagnosis(BaseModel):
    root_cause: str
    explanation: str
    severity: str
    evidence: list[str]
    remediation_steps: list[RemediationStep]


class DiagnoseResponse(BaseModel):
    pod: str
    namespace: str
    diagnosis: Diagnosis
    metrics: ModelMetrics | None = None


class HealthResponse(BaseModel):
    status: str = "ok"


class LogEntry(BaseModel):
    timestamp: str
    line: str
    labels: dict[str, str] = {}


class LogsResponse(BaseModel):
    query: str
    entries: list[LogEntry]


class MetricSample(BaseModel):
    timestamp: float
    value: str


class MetricResult(BaseModel):
    metric: dict[str, str]
    values: list[MetricSample]


class MetricsResponse(BaseModel):
    query: str
    results: list[MetricResult]


class K8sEvent(BaseModel):
    namespace: str
    name: str
    reason: str
    message: str
    type: str
    involved_object: str
    timestamp: str | None = None


class EventsResponse(BaseModel):
    namespace: str
    events: list[K8sEvent]


class ChatMessage(BaseModel):
    role: str
    content: str


class MetricsHistoryEntry(BaseModel):
    id: int
    timestamp: datetime
    namespace: str
    pod: str
    model: str
    latency_ms: float
    tokens_generated: int | None = None
    tokens_per_second: float | None = None
    accuracy: float | None = None
    explanation_quality: float | None = None
    root_cause: str | None = None
    explanation: str | None = None
    severity: str | None = None
    evidence: list[str] | None = None
    remediation_steps: list[RemediationStep] | None = None


class MetricsHistoryResponse(BaseModel):
    entries: list[MetricsHistoryEntry]
    total: int
