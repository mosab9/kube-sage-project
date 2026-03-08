import { useEffect, useRef, useState } from 'react';
import { useChat } from '../hooks/useWebSocket';
import ModelSelector from './ModelSelector';
import MetricsDisplay from './MetricsDisplay';

interface ChatPanelProps {
  showMetrics?: boolean;
}

export default function ChatPanel({ showMetrics = true }: ChatPanelProps) {
  const { messages, streaming, send, connect, currentModel, setModel, lastMetrics } = useChat();
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    connect();
  }, [connect]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    setModel(model);
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text || streaming) return;
    send(text, selectedModel || undefined);
    setInput('');
  };

  const formatTokensPerSec = (tps: number | null | undefined): string => {
    if (!tps) return '';
    return `${tps.toFixed(1)} tok/s`;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      <div className="flex items-center gap-3 p-3 border-b border-slate-700">
        <span className="text-xs text-slate-400">Model:</span>
        <ModelSelector value={selectedModel} onChange={handleModelChange} disabled={streaming} />
        {currentModel && (
          <span className="text-xs text-slate-500">Active: {currentModel}</span>
        )}
      </div>
      <div className="flex-1 overflow-auto space-y-3 p-4">
        {messages.length === 0 && (
          <p className="text-slate-500 text-center mt-20">
            Ask KubeSage about your cluster...
          </p>
        )}
        {messages.map((msg, i) => (
          <div key={i}>
            <div
              className={`max-w-[80%] p-3 rounded-lg text-sm ${
                msg.role === 'user'
                  ? 'ml-auto bg-cyan-900/40 text-cyan-100'
                  : 'mr-auto bg-slate-800 text-slate-200'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
            {msg.role === 'assistant' && msg.metrics && showMetrics && (
              <div className="mr-auto mt-1 flex items-center gap-2 text-xs text-slate-500">
                <span>{msg.metrics.model}</span>
                {msg.metrics.eval_count && <span>{msg.metrics.eval_count} tokens</span>}
                {msg.metrics.tokens_per_second && (
                  <span className="text-cyan-400">{formatTokensPerSec(msg.metrics.tokens_per_second)}</span>
                )}
              </div>
            )}
          </div>
        ))}
        {streaming && (
          <div className="mr-auto text-xs text-slate-500 animate-pulse">Thinking...</div>
        )}
        <div ref={bottomRef} />
      </div>
      {showMetrics && lastMetrics && !streaming && messages.length > 0 && (
        <div className="px-4 pb-2">
          <MetricsDisplay metrics={lastMetrics} compact />
        </div>
      )}
      <div className="border-t border-slate-700 p-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask about your cluster..."
          className="flex-1 bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
        />
        <button
          onClick={handleSend}
          disabled={streaming || !input.trim()}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm rounded font-medium"
        >
          Send
        </button>
      </div>
    </div>
  );
}
