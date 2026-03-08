export interface OllamaModel {
  name: string;
  size: number | null;
  modified_at: string | null;
  digest: string | null;
}

export interface ModelsResponse {
  models: OllamaModel[];
}

export interface ModelMetrics {
  model: string;
  latency_ms: number;
  tokens_generated: number | null;
  tokens_per_second: number | null;
  prompt_eval_count: number | null;
  eval_count: number | null;
  total_duration_ns: number | null;
  load_duration_ns: number | null;
  prompt_eval_duration_ns: number | null;
  eval_duration_ns: number | null;
}

export interface LogEntry {
  timestamp: string;
  line: string;
  labels: Record<string, string>;
}

export interface LogsResponse {
  query: string;
  entries: LogEntry[];
}

export interface MetricSample {
  timestamp: number;
  value: string;
}

export interface MetricResult {
  metric: Record<string, string>;
  values: MetricSample[];
}

export interface MetricsResponse {
  query: string;
  results: MetricResult[];
}

export interface K8sEvent {
  namespace: string;
  name: string;
  reason: string;
  message: string;
  type: string;
  involved_object: string;
  timestamp: string | null;
}

export interface EventsResponse {
  namespace: string;
  events: K8sEvent[];
}

export interface RemediationStep {
  description: string;
  command: string | null;
  executable: boolean;
}

export interface Diagnosis {
  root_cause: string;
  explanation: string;
  severity: string;
  evidence: string[];
  remediation_steps: RemediationStep[];
}

export interface DiagnoseRequest {
  namespace: string;
  pod: string;
  timeframe: string;
  model?: string;
}

export interface DiagnoseResponse {
  pod: string;
  namespace: string;
  diagnosis: Diagnosis;
  metrics: ModelMetrics | null;
}

export interface HealthResponse {
  status: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  metrics?: ChatResponseMetrics;
}

export interface ChatResponseMetrics {
  model: string;
  eval_count: number | null;
  total_duration_ns: number | null;
  prompt_eval_duration_ns: number | null;
  eval_duration_ns: number | null;
  tokens_per_second: number | null;
}

export interface MetricsHistoryEntry {
  id: number;
  timestamp: string;
  namespace: string;
  pod: string;
  model: string;
  latency_ms: number;
  tokens_generated: number | null;
  tokens_per_second: number | null;
  accuracy: number | null;
  explanation_quality: number | null;
  root_cause: string | null;
  explanation: string | null;
  severity: string | null;
  evidence: string[] | null;
  remediation_steps: RemediationStep[] | null;
}

export interface MetricsHistoryResponse {
  entries: MetricsHistoryEntry[];
  total: number;
}
