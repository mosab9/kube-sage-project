import { useEffect, useState } from 'react';
import { api } from '../services/api';
import EventsTable from '../components/EventsTable';
import type { K8sEvent } from '../types/api';

export default function EventsPage() {
  const [namespace, setNamespace] = useState('default');
  const [events, setEvents] = useState<K8sEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFetch = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.events(namespace);
      setEvents(res.events);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetch();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Kubernetes Events</h1>
      <div className="flex gap-2 mb-4">
        <input
          value={namespace}
          onChange={(e) => setNamespace(e.target.value)}
          placeholder="Namespace"
          className="w-48 bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
        />
        <button
          onClick={handleFetch}
          disabled={loading}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 text-white text-sm rounded font-medium"
        >
          {loading ? 'Loading...' : 'Fetch'}
        </button>
      </div>
      {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
      <EventsTable events={events} />
    </div>
  );
}
