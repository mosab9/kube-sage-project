import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import DiagnosisPanel from '../components/DiagnosisPanel';
import ModelSelector from '../components/ModelSelector';
import MetricsDisplay from '../components/MetricsDisplay';
import MetricsHistoryTable from '../components/MetricsHistoryTable';
import type { DiagnoseResponse, MetricsHistoryEntry } from '../types/api';

export default function DiagnosePage() {
  const [namespace, setNamespace] = useState('default');
  const [pod, setPod] = useState('kube-metrics-simulator');
  const [timeframe, setTimeframe] = useState('1h');
  const [model, setModel] = useState('');
  const [result, setResult] = useState<DiagnoseResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [metricsHistory, setMetricsHistory] = useState<MetricsHistoryEntry[]>([]);

  const fetchMetricsHistory = useCallback(async () => {
    try {
      const res = await api.metricsHistory();
      setMetricsHistory(res.entries);
    } catch {
      // Silently fail for history fetch
    }
  }, []);

  useEffect(() => {
    fetchMetricsHistory();
  }, [fetchMetricsHistory]);

  const handleClearHistory = async () => {
    try {
      await api.clearMetricsHistory();
      setMetricsHistory([]);
    } catch {
      // Silently fail
    }
  };

  const handleDiagnose = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await api.diagnose({ namespace, pod, timeframe, model: model || undefined });
      setResult(res);
      fetchMetricsHistory();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Diagnosis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Diagnose</h1>
      <div className="flex gap-2 mb-4 flex-wrap items-center">
        <input
          value={namespace}
          onChange={(e) => setNamespace(e.target.value)}
          placeholder="Namespace"
          className="w-40 bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
        />
        <input
          value={pod}
          onChange={(e) => setPod(e.target.value)}
          placeholder="Pod name"
          className="flex-1 bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
        />
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="w-24 bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
        >
          <option value="15m">15m</option>
          <option value="30m">30m</option>
          <option value="1h">1h</option>
          <option value="6h">6h</option>
          <option value="24h">24h</option>
        </select>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Model:</span>
          <ModelSelector value={model} onChange={setModel} disabled={loading} />
        </div>
        <button
          onClick={handleDiagnose}
          disabled={loading}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 text-white text-sm rounded font-medium"
        >
          {loading ? 'Diagnosing...' : 'Diagnose'}
        </button>
      </div>
      {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
      {loading && <p className="text-slate-400 text-sm animate-pulse">Collecting context and querying LLM...</p>}
      {result && (
        <>
          <DiagnosisPanel
            diagnosis={result.diagnosis}
            pod={result.pod}
            namespace={result.namespace}
          />
          <MetricsDisplay metrics={result.metrics} />
        </>
      )}
      <div className="mt-6">
        <MetricsHistoryTable entries={metricsHistory} onClear={handleClearHistory} />
      </div>
    </div>
  );
}
