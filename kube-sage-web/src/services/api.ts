import type {
  HealthResponse,
  LogsResponse,
  MetricsResponse,
  EventsResponse,
  DiagnoseRequest,
  DiagnoseResponse,
  ModelsResponse,
  MetricsHistoryResponse,
} from '../types/api';

const BASE = '/api/v1';

async function get<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(path, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

async function del<T>(path: string): Promise<T> {
  const res = await fetch(path, { method: 'DELETE' });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export const api = {
  health: () => get<HealthResponse>(`${BASE}/health`),

  logs: (query: string, limit = 100) =>
    get<LogsResponse>(`${BASE}/logs`, { query, limit: String(limit) }),

  metrics: (query: string, step = '60') =>
    get<MetricsResponse>(`${BASE}/metrics`, { query, step }),

  events: (namespace = 'default') =>
    get<EventsResponse>(`${BASE}/events`, { namespace }),

  esLogs: (q = '*', index = 'logs-*', limit = 100) =>
    get<LogsResponse>(`${BASE}/es-logs`, { q, index, limit: String(limit) }),

  diagnose: (req: DiagnoseRequest) =>
    post<DiagnoseResponse>(`${BASE}/diagnose`, req),

  models: () => get<ModelsResponse>(`${BASE}/models`),

  metricsHistory: () => get<MetricsHistoryResponse>(`${BASE}/metrics-history`),

  clearMetricsHistory: () => del<{ status: string }>(`${BASE}/metrics-history`),
};
