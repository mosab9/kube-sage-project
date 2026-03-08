import { useState } from 'react';
import type { MetricsHistoryEntry } from '../types/api';

interface Props {
  entries: MetricsHistoryEntry[];
  onClear?: () => void;
}

function formatTimestamp(ts: string): string {
  const date = new Date(ts);
  return date.toLocaleString();
}

function formatNumber(n: number | null, decimals = 2): string {
  if (n === null) return '—';
  return n.toFixed(decimals);
}

function getSeverityColor(severity: string | null): string {
  switch (severity?.toLowerCase()) {
    case 'critical':
      return 'bg-red-900/50 text-red-300';
    case 'high':
      return 'bg-orange-900/50 text-orange-300';
    case 'medium':
      return 'bg-amber-900/50 text-amber-300';
    case 'low':
      return 'bg-green-900/50 text-green-300';
    default:
      return 'bg-slate-700 text-slate-300';
  }
}

export default function MetricsHistoryTable({ entries, onClear }: Props) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="bg-slate-950 rounded border border-slate-700">
      <div className="flex items-center justify-between p-3 border-b border-slate-700">
        <h3 className="text-sm font-medium text-slate-300">
          Performance Metrics History ({entries.length})
        </h3>
        {onClear && entries.length > 0 && (
          <button
            onClick={onClear}
            className="px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded"
          >
            Clear
          </button>
        )}
      </div>
      <div className="overflow-auto max-h-[500px]">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-slate-900">
            <tr className="text-slate-400 text-left">
              <th className="p-2 w-8"></th>
              <th className="p-2">Time</th>
              <th className="p-2">Pod</th>
              <th className="p-2">Model</th>
              <th className="p-2">Severity</th>
              <th className="p-2 text-right">Latency</th>
              <th className="p-2 text-right">Tokens/s</th>
              <th className="p-2 text-right">Accuracy</th>
              <th className="p-2 text-right">Quality</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <>
                <tr
                  key={entry.id}
                  className="border-t border-slate-800 hover:bg-slate-900/50 cursor-pointer"
                  onClick={() => toggleExpand(entry.id)}
                >
                  <td className="p-2 text-slate-500">
                    <span className="text-xs">{expandedId === entry.id ? '▼' : '▶'}</span>
                  </td>
                  <td className="p-2 text-slate-500 text-xs whitespace-nowrap">
                    {formatTimestamp(entry.timestamp)}
                  </td>
                  <td className="p-2 text-slate-200">
                    <span className="font-mono text-xs text-slate-400">{entry.namespace}/</span>
                    {entry.pod}
                  </td>
                  <td className="p-2">
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-cyan-900/50 text-cyan-300">
                      {entry.model}
                    </span>
                  </td>
                  <td className="p-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getSeverityColor(entry.severity)}`}>
                      {entry.severity ?? '—'}
                    </span>
                  </td>
                  <td className="p-2 text-right text-slate-300 font-mono text-xs">
                    {formatNumber(entry.latency_ms, 0)}ms
                  </td>
                  <td className="p-2 text-right text-slate-300 font-mono text-xs">
                    {formatNumber(entry.tokens_per_second)}
                  </td>
                  <td className="p-2 text-right">
                    {entry.accuracy !== null ? (
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-900/50 text-green-300">
                        {formatNumber(entry.accuracy)}%
                      </span>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>
                  <td className="p-2 text-right">
                    {entry.explanation_quality !== null ? (
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-900/50 text-purple-300">
                        {formatNumber(entry.explanation_quality)}%
                      </span>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>
                </tr>
                {expandedId === entry.id && (
                  <tr key={`${entry.id}-details`} className="bg-slate-900/30">
                    <td colSpan={9} className="p-4">
                      <div className="grid gap-4">
                        <div>
                          <h4 className="text-xs font-medium text-slate-400 mb-1">Root Cause</h4>
                          <p className="text-sm text-slate-200">{entry.root_cause ?? '—'}</p>
                        </div>
                        <div>
                          <h4 className="text-xs font-medium text-slate-400 mb-1">Explanation</h4>
                          <p className="text-sm text-slate-300">{entry.explanation ?? '—'}</p>
                        </div>
                        {entry.evidence && entry.evidence.length > 0 && (
                          <div>
                            <h4 className="text-xs font-medium text-slate-400 mb-1">Evidence</h4>
                            <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
                              {entry.evidence.map((e, i) => (
                                <li key={i}>{e}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {entry.remediation_steps && entry.remediation_steps.length > 0 && (
                          <div>
                            <h4 className="text-xs font-medium text-slate-400 mb-1">Remediation Steps</h4>
                            <ol className="list-decimal list-inside text-sm text-slate-300 space-y-2">
                              {entry.remediation_steps.map((step, i) => (
                                <li key={i}>
                                  <span>{step.description}</span>
                                  {step.command && (
                                    <code className="block mt-1 ml-5 px-2 py-1 bg-slate-800 rounded text-xs text-cyan-300 font-mono">
                                      {step.command}
                                    </code>
                                  )}
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
        {entries.length === 0 && (
          <p className="p-4 text-center text-slate-500">No metrics history yet</p>
        )}
      </div>
    </div>
  );
}
