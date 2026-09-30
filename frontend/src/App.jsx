import React, { useState } from 'react';
import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';

// Contexts
import { useAuth } from './context/AuthContext';
import { useRole } from './context/RoleContext';

// Components
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

// Pages
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import AlarmsPage from './pages/AlarmsPage';
import PuzzlesPage from './pages/PuzzlesPage';
import AnalyticsPage from './views/AnalyticsPage';\nimport AdaptiveEnginePage from './views/AdaptiveEnginePage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';
import ReportPage from './pages/ReportPage';

// Role Dashboards
import CoachDashboard from './pages/coach/CoachDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

/* ─── Protected Coach route ─── */
function CoachRoute({ children }) {
  const { roleUser } = useRole();
  if (!roleUser || roleUser.role !== 'coach') return <Navigate to="/" replace />;
  return children;
}

/* ─── Protected Admin route ─── */
function AdminRoute({ children }) {
  const { roleUser } = useRole();
  if (!roleUser || roleUser.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

/* ─── Standard User Layout ─── */
function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="app-layout">
      <Navbar onMenuToggle={() => setSidebarOpen(prev => !prev)} />
      <div className="app-body">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="app-main">
          <Routes>
            <Route path="/"          element={<Dashboard />} />
            <Route path="/alarms"    element={<AlarmsPage />} />
            <Route path="/puzzles"   element={<PuzzlesPage />} />
            <Route path="/adaptive" element={<AdaptiveEnginePage />} />\n        <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/history"   element={<HistoryPage />} />
            <Route path="/report"    element={<ReportPage />} />
            <Route path="/settings"  element={<SettingsPage />} />
            <Route path="*"          element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

/* ─── Warm Editorial Loading Screen ─── */
function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
        <div style={{ position: 'relative', width: 54, height: 54 }}>
          <div style={{ position: 'absolute', inset: 0, border: '2px solid rgba(67, 47, 46, 0.12)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', inset: 0, border: '3px solid transparent', borderTopColor: '#432f2e', borderRadius: '50%', animation: 'spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite' }} />
          <div style={{ position: 'absolute', inset: 8, border: '2px solid transparent', borderTopColor: '#feefb8', borderRadius: '50%', animation: 'spin 1.2s linear infinite reverse' }} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: "'Lora', Georgia, 'Times New Roman', serif", fontWeight: 700, fontSize: 18, color: '#432f2e', letterSpacing: '-0.01em' }}>CognAlarm</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Preparing cognitive environment…</div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/* ─── Root App ─── */
export default function App() {
  const { user, loading } = useAuth();
  const { roleUser } = useRole();

  if (loading) return <LoadingScreen />;

  // 1. If Coach is logged in
  if (roleUser?.role === 'coach') {
    return (
      <Routes>
        <Route path="/coach/*" element={<CoachDashboard />} />
        <Route path="*" element={<Navigate to="/coach" replace />} />
      </Routes>
    );
  }

  // 2. If Admin is logged in
  if (roleUser?.role === 'admin') {
    return (
      <Routes>
        <Route path="/admin/*" element={<AdminDashboard />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    );
  }

  // 3. If standard User is logged in
  if (user) {
    return <AppLayout />;
  }

  // 4. If no one is logged in -> Single Unified Login Page
  return (
    <Routes>
      <Route path="*" element={<AuthPage />} />
    </Routes>
  );
}
