import type { LogEntry } from '../types/api';

interface Props {
  entries: LogEntry[];
}

export default function LogViewer({ entries }: Props) {
  return (
    <div className="bg-slate-950 rounded border border-slate-700 overflow-auto max-h-[600px]">
      <table className="w-full text-xs font-mono">
        <thead className="sticky top-0 bg-slate-900">
          <tr className="text-slate-400">
            <th className="text-left p-2 w-48">Timestamp</th>
            <th className="text-left p-2">Message</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, i) => (
            <tr key={i} className="border-t border-slate-800 hover:bg-slate-900/50">
              <td className="p-2 text-slate-500 whitespace-nowrap">
                {entry.timestamp}
              </td>
              <td className="p-2 text-slate-200 whitespace-pre-wrap break-all">
                {entry.line}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {entries.length === 0 && (
        <p className="p-4 text-center text-slate-500">No log entries</p>
      )}
    </div>
  );
}
