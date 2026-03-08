import type { K8sEvent } from '../types/api';

interface Props {
  events: K8sEvent[];
}

export default function EventsTable({ events }: Props) {
  return (
    <div className="bg-slate-950 rounded border border-slate-700 overflow-auto max-h-[600px]">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-slate-900">
          <tr className="text-slate-400 text-left">
            <th className="p-2">Type</th>
            <th className="p-2">Reason</th>
            <th className="p-2">Object</th>
            <th className="p-2">Message</th>
            <th className="p-2">Time</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e, i) => (
            <tr key={i} className="border-t border-slate-800 hover:bg-slate-900/50">
              <td className="p-2">
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium ${
                    e.type === 'Warning'
                      ? 'bg-amber-900/50 text-amber-300'
                      : 'bg-green-900/50 text-green-300'
                  }`}
                >
                  {e.type}
                </span>
              </td>
              <td className="p-2 text-slate-200">{e.reason}</td>
              <td className="p-2 text-slate-400 font-mono text-xs">{e.involved_object}</td>
              <td className="p-2 text-slate-300">{e.message}</td>
              <td className="p-2 text-slate-500 text-xs whitespace-nowrap">{e.timestamp ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {events.length === 0 && (
        <p className="p-4 text-center text-slate-500">No events</p>
      )}
    </div>
  );
}
