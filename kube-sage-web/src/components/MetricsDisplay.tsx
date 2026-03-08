import type { ModelMetrics, ChatResponseMetrics } from '../types/api';

interface MetricsDisplayProps {
  metrics: ModelMetrics | ChatResponseMetrics | null;
  compact?: boolean;
}

export default function MetricsDisplay({ metrics, compact = false }: MetricsDisplayProps) {
  if (!metrics) return null;

  const formatDuration = (ns: number | null): string => {
    if (!ns) return '-';
    const ms = ns / 1e6;
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatTokensPerSec = (tps: number | null | undefined): string => {
    if (!tps) return '-';
    return `${tps.toFixed(1)} tok/s`;
  };

  // Check if this is ModelMetrics (has latency_ms)
  const isFullMetrics = 'latency_ms' in metrics;

  if (compact) {
    return (
      <div className="flex items-center gap-3 text-xs text-slate-400">
        <span className="font-medium text-slate-300">{metrics.model}</span>
        {isFullMetrics && (
          <span>{(metrics as ModelMetrics).latency_ms.toFixed(0)}ms</span>
        )}
        {metrics.eval_count && (
          <span>{metrics.eval_count} tokens</span>
        )}
        {metrics.tokens_per_second && (
          <span className="text-cyan-400">{formatTokensPerSec(metrics.tokens_per_second)}</span>
        )}
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mt-4">
      <h3 className="text-sm font-semibold text-slate-300 mb-3">Performance Metrics</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Model" value={metrics.model} />
        {isFullMetrics && (
          <MetricCard
            label="Total Latency"
            value={`${(metrics as ModelMetrics).latency_ms.toFixed(0)}ms`}
            highlight
          />
        )}
        <MetricCard
          label="Tokens Generated"
          value={metrics.eval_count?.toString() || '-'}
        />
        <MetricCard
          label="Speed"
          value={formatTokensPerSec(metrics.tokens_per_second)}
          highlight
        />
        {isFullMetrics && (metrics as ModelMetrics).prompt_eval_count && (
          <MetricCard
            label="Prompt Tokens"
            value={(metrics as ModelMetrics).prompt_eval_count?.toString() || '-'}
          />
        )}
        {metrics.total_duration_ns && (
          <MetricCard
            label="Total Duration"
            value={formatDuration(metrics.total_duration_ns)}
          />
        )}
        {isFullMetrics && (metrics as ModelMetrics).load_duration_ns && (
          <MetricCard
            label="Model Load Time"
            value={formatDuration((metrics as ModelMetrics).load_duration_ns)}
          />
        )}
        {metrics.prompt_eval_duration_ns && (
          <MetricCard
            label="Prompt Processing"
            value={formatDuration(metrics.prompt_eval_duration_ns)}
          />
        )}
        {metrics.eval_duration_ns && (
          <MetricCard
            label="Generation Time"
            value={formatDuration(metrics.eval_duration_ns)}
          />
        )}
      </div>
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  highlight?: boolean;
}

function MetricCard({ label, value, highlight }: MetricCardProps) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-slate-500 uppercase tracking-wide">{label}</span>
      <span className={`text-sm font-medium ${highlight ? 'text-cyan-400' : 'text-slate-200'}`}>
        {value}
      </span>
    </div>
  );
}
