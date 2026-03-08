import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { MetricResult } from '../types/api';

interface Props {
  results: MetricResult[];
}

export default function MetricsChart({ results }: Props) {
  if (results.length === 0) {
    return <p className="text-slate-500 text-center py-8">No metric data</p>;
  }

  const data = results[0].values.map((v) => ({
    time: new Date(v.timestamp * 1000).toLocaleTimeString(),
    value: parseFloat(v.value),
  }));

  const label = Object.entries(results[0].metric)
    .map(([k, v]) => `${k}="${v}"`)
    .join(', ');

  return (
    <div>
      <p className="text-xs text-slate-400 mb-2">{label}</p>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 10 }} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
            labelStyle={{ color: '#e2e8f0' }}
          />
          <Line type="monotone" dataKey="value" stroke="#22d3ee" dot={false} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
