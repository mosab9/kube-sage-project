import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

export default function DashboardPage() {
  const [healthy, setHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    api.health().then(() => setHealthy(true)).catch(() => setHealthy(false));
  }, []);

  const cards = [
    { label: 'Logs', desc: 'Query Loki for pod logs', to: '/logs' },
    { label: 'ELK Logs', desc: 'Query Elasticsearch for pod logs', to: '/es-logs' },
    { label: 'Metrics', desc: 'Query Prometheus metrics', to: '/metrics' },
    { label: 'Events', desc: 'View Kubernetes events', to: '/events' },
    { label: 'Diagnose', desc: 'AI-powered pod diagnosis', to: '/diagnose' },
    { label: 'Chat', desc: 'Interactive troubleshooting', to: '/chat' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
      <p className="text-sm text-slate-400 mb-6">
        API Status:{' '}
        <span className={healthy === null ? 'text-slate-500' : healthy ? 'text-green-400' : 'text-red-400'}>
          {healthy === null ? 'Checking...' : healthy ? 'Connected' : 'Unreachable'}
        </span>
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className="block p-4 bg-slate-900 border border-slate-700 rounded-lg hover:border-cyan-600 transition-colors"
          >
            <h2 className="text-lg font-semibold text-cyan-400">{c.label}</h2>
            <p className="text-sm text-slate-400 mt-1">{c.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
