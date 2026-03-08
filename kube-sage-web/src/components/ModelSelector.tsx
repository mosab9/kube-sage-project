import { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { OllamaModel } from '../types/api';

interface ModelSelectorProps {
  value: string;
  onChange: (model: string) => void;
  disabled?: boolean;
}

export default function ModelSelector({ value, onChange, disabled }: ModelSelectorProps) {
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await api.models();
        setModels(response.models);
        // Set first model as default if no value is set
        if (!value && response.models.length > 0) {
          onChange(response.models[0].name);
        }
      } catch (e) {
        setError('Failed to load models');
        console.error('Failed to fetch models:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchModels();
  }, []);

  const formatSize = (bytes: number | null): string => {
    if (!bytes) return '';
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(1)}GB`;
  };

  if (loading) {
    return (
      <select
        disabled
        className="w-48 bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-slate-400"
      >
        <option>Loading models...</option>
      </select>
    );
  }

  if (error) {
    return (
      <select
        disabled
        className="w-48 bg-slate-800 border border-red-600 rounded px-3 py-2 text-sm text-red-400"
      >
        <option>{error}</option>
      </select>
    );
  }

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="w-48 bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 disabled:opacity-50"
    >
      {models.map((model) => (
        <option key={model.name} value={model.name}>
          {model.name} {model.size ? `(${formatSize(model.size)})` : ''}
        </option>
      ))}
    </select>
  );
}
