import { useCallback, useRef, useState } from 'react';
import type { ChatMessage, ChatResponseMetrics } from '../types/api';

export function useChat() {
  const wsRef = useRef<WebSocket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [currentModel, setCurrentModel] = useState<string>('');
  const [lastMetrics, setLastMetrics] = useState<ChatResponseMetrics | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const ws = new WebSocket(`${protocol}://${window.location.host}/api/v1/ws/chat`);
    let buffer = '';

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'token') {
        buffer += data.content;
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last?.role === 'assistant') {
            updated[updated.length - 1] = { ...last, content: buffer };
          } else {
            updated.push({ role: 'assistant', content: buffer });
          }
          return updated;
        });
      } else if (data.type === 'done') {
        // Update the last assistant message with metrics
        if (data.metrics) {
          setLastMetrics(data.metrics);
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last?.role === 'assistant') {
              updated[updated.length - 1] = { ...last, metrics: data.metrics };
            }
            return updated;
          });
        }
        buffer = '';
        setStreaming(false);
      } else if (data.type === 'model_set') {
        setCurrentModel(data.model);
      }
    };

    ws.onclose = () => { wsRef.current = null; };
    wsRef.current = ws;
  }, []);

  const send = useCallback((content: string, model?: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      connect();
      setTimeout(() => send(content, model), 500);
      return;
    }
    setMessages((prev) => [...prev, { role: 'user', content }]);
    setStreaming(true);
    wsRef.current.send(JSON.stringify({ content, model }));
  }, [connect]);

  const setModel = useCallback((model: string) => {
    setCurrentModel(model);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'set_model', model }));
    }
  }, []);

  return { messages, streaming, send, connect, currentModel, setModel, lastMetrics };
}
