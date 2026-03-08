import type { Diagnosis } from '../types/api';

interface Props {
  diagnosis: Diagnosis;
  pod: string;
  namespace: string;
}

const severityColor: Record<string, string> = {
  critical: 'bg-red-900/50 text-red-300',
  high: 'bg-orange-900/50 text-orange-300',
  medium: 'bg-amber-900/50 text-amber-300',
  low: 'bg-green-900/50 text-green-300',
};

export default function DiagnosisPanel({ diagnosis, pod, namespace }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-400">
          {namespace}/{pod}
        </span>
        <span
          className={`px-2 py-0.5 rounded text-xs font-medium ${
            severityColor[diagnosis.severity] ?? 'bg-slate-700 text-slate-300'
          }`}
        >
          {diagnosis.severity}
        </span>
      </div>

      <div className="bg-slate-900 rounded p-4 border border-slate-700">
        <h3 className="text-sm font-semibold text-cyan-400 mb-1">Root Cause</h3>
        <p className="text-sm text-slate-200">{diagnosis.root_cause}</p>
      </div>

      <div className="bg-slate-900 rounded p-4 border border-slate-700">
        <h3 className="text-sm font-semibold text-cyan-400 mb-1">Explanation</h3>
        <p className="text-sm text-slate-300">{diagnosis.explanation}</p>
      </div>

      {diagnosis.evidence.length > 0 && (
        <div className="bg-slate-900 rounded p-4 border border-slate-700">
          <h3 className="text-sm font-semibold text-cyan-400 mb-2">Evidence</h3>
          <ul className="list-disc list-inside space-y-1">
            {diagnosis.evidence.map((e, i) => (
              <li key={i} className="text-sm text-slate-300">{e}</li>
            ))}
          </ul>
        </div>
      )}

      {diagnosis.remediation_steps.length > 0 && (
        <div className="bg-slate-900 rounded p-4 border border-slate-700">
          <h3 className="text-sm font-semibold text-cyan-400 mb-2">Remediation Steps</h3>
          <ol className="list-decimal list-inside space-y-2">
            {diagnosis.remediation_steps.map((s, i) => (
              <li key={i} className="text-sm text-slate-300">
                {s.description}
                {s.command && (
                  <code className="block mt-1 ml-5 p-2 bg-slate-950 rounded text-xs text-green-300 font-mono">
                    {s.command}
                  </code>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
