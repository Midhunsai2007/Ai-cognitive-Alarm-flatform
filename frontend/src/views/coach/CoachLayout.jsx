import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useRole } from '../../context/RoleContext';
import { useTheme } from '../../context/ThemeContext';
import { Heart, LayoutDashboard, Users, TrendingUp, Sun, Moon, LogOut, ChevronDown, Activity, BarChart3 } from 'lucide-react';

const NAV = [
  { to: '/coach',              label: 'Overview',       icon: LayoutDashboard, color: '#10b981' },
  { to: '/coach/behavior',     label: 'User Behavior',  icon: Activity,        color: '#60a5fa' },
  { to: '/coach/habits',       label: 'Habit Adherence',icon: TrendingUp,      color: '#a78bfa' },
  { to: '/coach/sleep',        label: 'Sleep Trends',   icon: Moon,            color: '#818cf8' },
  { to: '/coach/progress',     label: 'Progress',       icon: Users,           color: '#fbbf24' },
];

function CoachNavbar({ onMenuToggle }) {
  const { roleUser, logoutRole } = useRole();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logoutRole();
    navigate('/');
  };

  return (
    <header style={{
      height: 58, display: 'flex', alignItems: 'center', padding: '0 20px',
      background: 'var(--navbar-bg)', backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(16,185,129,0.15)',
      position: 'sticky', top: 0, zIndex: 50, gap: 14,
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 14px rgba(16,185,129,0.5)', flexShrink: 0 }}>
          <Heart size={15} color="#fff" />
        </div>
        <div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 14, color: '#10b981', lineHeight: 1 }}>Wellness Coach</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>CognAlarm Portal</div>
        </div>
      </div>

      <div style={{ flex: 1 }} />

      {/* Indicator badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 12px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 20, fontSize: 11, fontWeight: 700, color: '#10b981' }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px rgba(16,185,129,0.8)' }} />
        Coach Portal
      </div>

      {/* Theme toggle */}
      <button onClick={toggleTheme} style={{ width: 34, height: 34, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 9, cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.14)'; e.currentTarget.style.color = '#10b981'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.06)'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
        {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
      </button>

      {/* Profile */}
      <div style={{ position: 'relative' }}>
        <button onClick={() => setProfileOpen(o => !o)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, cursor: 'pointer', padding: '5px 12px 5px 6px', transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.12)'; }} onMouseLeave={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.06)'; }}>
          <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#fff', boxShadow: '0 0 8px rgba(16,185,129,0.4)', flexShrink: 0 }}>
            {roleUser?.name?.charAt(0)}
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{roleUser?.name?.split(' ')[0]}</span>
          <ChevronDown size={12} color="var(--text-muted)" style={{ transform: profileOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </button>
        {profileOpen && (
          <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 200, background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 12, boxShadow: '0 16px 48px rgba(0,0,0,0.3)', zIndex: 60, overflow: 'hidden' }}>
            <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(16,185,129,0.1)' }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>{roleUser?.name}</div>
              <div style={{ fontSize: 11, color: '#10b981', marginTop: 1 }}>{roleUser?.title}</div>
            </div>
            <div style={{ padding: 6 }}>
              <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '9px 10px', fontSize: 13, color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 8, textAlign: 'left' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(244,63,94,0.1)'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                <LogOut size={14} /> Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

function CoachSidebar() {
  const { pathname } = useLocation();

  return (
    <aside style={{
      position: 'fixed', top: 0, left: 0, bottom: 0,
      width: 'var(--sidebar-w)',
      background: 'var(--sidebar-bg)',
      backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
      borderRight: '1px solid rgba(16,185,129,0.1)',
      zIndex: 40, display: 'flex', flexDirection: 'column', paddingTop: 58,
    }} className="hidden md:flex">
      <nav style={{ padding: '14px 10px', flex: 1 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-muted)', padding: '4px 12px 10px', textTransform: 'uppercase' }}>Coach Menu</div>
        {NAV.map(({ to, label, icon: Icon, color }) => {
          const active = pathname === to || (to !== '/coach' && pathname.startsWith(to));
          return (
            <Link key={to} to={to} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: 10, fontSize: 13,
              fontWeight: active ? 600 : 500,
              color: active ? '#fff' : 'var(--text-secondary)',
              background: active ? 'linear-gradient(135deg, rgba(16,185,129,0.22), rgba(5,150,105,0.18))' : 'transparent',
              border: active ? '1px solid rgba(16,185,129,0.3)' : '1px solid transparent',
              textDecoration: 'none', transition: 'all 0.15s', marginBottom: 3,
              boxShadow: active ? '0 4px 16px rgba(16,185,129,0.15)' : 'none',
              position: 'relative', overflow: 'hidden',
            }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(16,185,129,0.07)'; e.currentTarget.style.color = 'var(--text)'; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}
            >
              {active && <div style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: 3, borderRadius: 2, background: '#10b981', boxShadow: '0 0 8px rgba(16,185,129,0.6)' }} />}
              <div style={{ width: 28, height: 28, borderRadius: 7, background: active ? `${color}20` : 'rgba(16,185,129,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={14} color={active ? color : 'var(--text-muted)'} />
              </div>
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
      <div style={{ margin: '8px 10px 16px', padding: '12px 14px', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.1)', borderRadius: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#10b981', marginBottom: 4 }}>🌿 Wellness Portal</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>Monitoring 12 active users · Last sync 2m ago</div>
      </div>
    </aside>
  );
}

export function CoachLayout({ children }) {
  return (
    <div className="app-layout">
      <CoachNavbar />
      <div className="app-body">
        <CoachSidebar />
        <main className="app-main">{children}</main>
      </div>
    </div>
  );
}
