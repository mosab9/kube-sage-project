import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/logs', label: 'Logs' },
  { to: '/es-logs', label: 'ELK Logs' },
  { to: '/metrics', label: 'Metrics' },
  { to: '/events', label: 'Events' },
  { to: '/diagnose', label: 'Diagnose' },
  { to: '/chat', label: 'Chat' },
];

export default function Sidebar() {
  return (
    <aside className="w-56 bg-slate-900 border-r border-slate-700 flex flex-col min-h-screen">
      <div className="p-4 border-b border-slate-700">
        <h1 className="text-xl font-bold text-cyan-400">KubeSage</h1>
        <p className="text-xs text-slate-400 mt-1">K8s Troubleshooting AI</p>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) =>
              `block px-3 py-2 rounded text-sm ${
                isActive
                  ? 'bg-cyan-900/50 text-cyan-300'
                  : 'text-slate-300 hover:bg-slate-800'
              }`
            }
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
