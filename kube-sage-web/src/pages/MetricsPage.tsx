import { useState } from 'react';
import { api } from '../services/api';
import MetricsChart from '../components/MetricsChart';
import type { MetricResult } from '../types/api';

export default function MetricsPage() {
  const [query, setQuery] = useState('rate(container_cpu_usage_seconds_total{namespace="default"}[5m])');
  const [results, setResults] = useState<MetricResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.metrics(query);
      setResults(res.results);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to fetch metrics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Metrics</h1>
      <div className="flex gap-2 mb-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="PromQL query"
          className="flex-1 bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 text-white text-sm rounded font-medium"
        >
          {loading ? 'Loading...' : 'Query'}
        </button>
      </div>
      {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
      <div className="bg-slate-900 rounded border border-slate-700 p-4">
        <MetricsChart results={results} />
      </div>
    </div>
  );
}
