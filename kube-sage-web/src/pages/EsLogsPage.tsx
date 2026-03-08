import { useState } from 'react';
import { api } from '../services/api';
import LogViewer from '../components/LogViewer';
import type { LogEntry } from '../types/api';

export default function EsLogsPage() {
  const [query, setQuery] = useState('*');
  const [index, setIndex] = useState('logs-*');
  const [limit, setLimit] = useState('100');
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.esLogs(query, index, parseInt(limit));
      setEntries(res.entries);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">ELK Logs</h1>
      <div className="flex gap-2 mb-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Elasticsearch query string"
          className="flex-1 bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
        />
        <input
          value={index}
          onChange={(e) => setIndex(e.target.value)}
          placeholder="Index pattern"
          className="w-36 bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
        />
        <input
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
          type="number"
          className="w-20 bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 text-white text-sm rounded font-medium"
        >
          {loading ? 'Loading...' : 'Search'}
        </button>
      </div>
      {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
      <LogViewer entries={entries} />
    </div>
  );
}
