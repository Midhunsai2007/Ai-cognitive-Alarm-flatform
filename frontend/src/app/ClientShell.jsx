'use client';
import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { RoleProvider, useRole } from '../context/RoleContext';
import { ThemeProvider } from '../context/ThemeContext';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import AuthPage from '../views/AuthPage';
import CoachDashboard from '../views/coach/CoachDashboard';
import AdminDashboard from '../views/admin/AdminDashboard';
import { usePathname } from 'next/navigation';

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
          <div style={{ fontFamily: "'Lora', Georgia, 'Times New Roman', serif", fontWeight: 700, fontSize: 18, color: 'var(--text)', letterSpacing: '-0.01em' }}>CognAlarm</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Preparing cognitive environment...</div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function InnerShell({ children }) {
  const { user, loading } = useAuth();
  const { roleUser } = useRole();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // When route changes on mobile, auto-close the drawer
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [pathname, isMobile]);

  if (!mounted || loading) {
    return <LoadingScreen />;
  }

  // 1. If Coach is logged in
  if (roleUser?.role === 'coach') {
    return <CoachDashboard />;
  }

  // 2. If Admin is logged in
  if (roleUser?.role === 'admin') {
    return <AdminDashboard />;
  }

  // 3. If User is not logged in and not on a public route, show AuthPage
  if (!user && pathname !== '/role-select' && pathname !== '/login') {
    return <AuthPage />;
  }

  // 4. Standard User Layout with Sidebar & Navbar
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', color: 'var(--text)' }}>
      <Navbar onMenuToggle={() => setSidebarOpen(prev => !prev)} />
      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main
          style={{
            flex: 1,
            paddingTop: '62px',
            marginLeft: (!isMobile && sidebarOpen) ? 'var(--sidebar-w)' : '0px',
            minHeight: 'calc(100vh - 62px)',
            transition: 'margin-left 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            width: '100%',
          }}
          className="app-main-content"
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export default function ClientShell({ children }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RoleProvider>
          <InnerShell>{children}</InnerShell>
        </RoleProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
