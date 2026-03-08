import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import LogsPage from './pages/LogsPage';
import MetricsPage from './pages/MetricsPage';
import EventsPage from './pages/EventsPage';
import DiagnosePage from './pages/DiagnosePage';
import ChatPage from './pages/ChatPage';
import EsLogsPage from './pages/EsLogsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/logs" element={<LogsPage />} />
          <Route path="/es-logs" element={<EsLogsPage />} />
          <Route path="/metrics" element={<MetricsPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/diagnose" element={<DiagnosePage />} />
          <Route path="/chat" element={<ChatPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
