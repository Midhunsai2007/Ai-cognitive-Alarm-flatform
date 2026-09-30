import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AdminLayout } from './AdminLayout';
import { useRole } from '../../context/RoleContext';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell,
} from 'recharts';
import {
  Users, BarChart3, Cpu, FileText, Shield, TrendingUp,
  CheckCircle2, Activity, AlertTriangle, Server, Database, Zap, RefreshCw, Trash2,
} from 'lucide-react';

// ─── Mock Data ───────────────────────────────────────────────────
const ALL_USERS = [
  { id: 1,  name: 'Alex Ramos',   email: 'alex@mail.com',   alarms: 24, streak: 12, success: 83, lastActive: '2m ago',   status: 'active',    role: 'user'  },
  { id: 2,  name: 'Priya Singh',  email: 'priya@mail.com',  alarms: 18, streak: 7,  success: 72, lastActive: '15m ago',  status: 'active',    role: 'user'  },
  { id: 3,  name: 'James Li',     email: 'james@mail.com',  alarms: 31, streak: 21, success: 94, lastActive: '1h ago',   status: 'active',    role: 'user'  },
  { id: 4,  name: 'Sara Khan',    email: 'sara@mail.com',   alarms: 10, streak: 3,  success: 60, lastActive: '2d ago',   status: 'inactive',  role: 'user'  },
  { id: 5,  name: 'Tom Nguyen',   email: 'tom@mail.com',    alarms: 20, streak: 9,  success: 78, lastActive: '4h ago',   status: 'active',    role: 'user'  },
  { id: 6,  name: 'Maria Costa',  email: 'maria@mail.com',  alarms: 27, streak: 15, success: 89, lastActive: '30m ago',  status: 'active',    role: 'user'  },
  { id: 7,  name: 'David Park',   email: 'david@mail.com',  alarms: 14, streak: 5,  success: 65, lastActive: '3d ago',   status: 'suspended', role: 'user'  },
  { id: 8,  name: 'Lena Mueller', email: 'lena@mail.com',   alarms: 29, streak: 18, success: 91, lastActive: '1h ago',   status: 'active',    role: 'user'  },
  { id: 9,  name: 'Kai Tanaka',   email: 'kai@mail.com',    alarms: 22, streak: 11, success: 80, lastActive: '20m ago',  status: 'active',    role: 'user'  },
  { id: 10, name: 'Anya Patel',   email: 'anya@mail.com',   alarms: 16, streak: 6,  success: 69, lastActive: '5h ago',   status: 'active',    role: 'user'  },
];

const platformWeekly = [
  { day: 'Mon', sessions: 42, alarms: 38, solved: 31, newUsers: 2 },
  { day: 'Tue', sessions: 36, alarms: 33, solved: 26, newUsers: 1 },
  { day: 'Wed', sessions: 48, alarms: 44, solved: 40, newUsers: 3 },
  { day: 'Thu', sessions: 39, alarms: 35, solved: 29, newUsers: 0 },
  { day: 'Fri', sessions: 51, alarms: 47, solved: 43, newUsers: 2 },
  { day: 'Sat', sessions: 28, alarms: 25, solved: 20, newUsers: 1 },
  { day: 'Sun', sessions: 22, alarms: 19, solved: 15, newUsers: 0 },
];

const recData = [
  { type: 'Math Easy',     count: 42, accuracy: 88 },
  { type: 'Math Medium',   count: 35, accuracy: 79 },
  { type: 'Pattern Easy',  count: 28, accuracy: 91 },
  { type: 'Memory Med',    count: 24, accuracy: 74 },
  { type: 'Stroop Hard',   count: 18, accuracy: 65 },
  { type: 'Word Easy',     count: 15, accuracy: 95 },
];

const userGrowth = [
  { month: 'Mar', users: 3 }, { month: 'Apr', users: 5 }, { month: 'May', users: 7 },
  { month: 'Jun', users: 8 }, { month: 'Jul', users: 9 }, { month: 'Aug', users: 10 },
];

const statusDist = [
  { name: 'Active',    value: 7, color: '#10b981' },
  { name: 'Inactive',  value: 2, color: '#fbbf24' },
  { name: 'Suspended', value: 1, color: '#f43f5e' },
];

const SYS_SERVICES = [
  { name: 'FastAPI Backend',    status: 'healthy', uptime: '99.9%', latency: '42ms',  icon: Server },
  { name: 'MongoDB Database',   status: 'healthy', uptime: '100%',  latency: '8ms',   icon: Database },
  { name: 'Scikit-learn ML',    status: 'healthy', uptime: '98.2%', latency: '120ms', icon: Cpu },
  { name: 'Node.js Express',    status: 'warning', uptime: '97.1%', latency: '65ms',  icon: Activity },
  { name: 'Authentication Svc', status: 'healthy', uptime: '99.7%', latency: '22ms',  icon: Shield },
];

const RECENT_LOGS = [
  { time: '17:22', level: 'info',    msg: 'User alex@mail.com completed Math puzzle in 14.2s' },
  { time: '17:19', level: 'info',    msg: 'New alarm created for user maria@mail.com — 06:30 weekdays' },
  { time: '17:15', level: 'warning', msg: 'Node.js response time exceeded 60ms threshold' },
  { time: '17:10', level: 'info',    msg: 'ML model prediction requested — confidence 0.87' },
  { time: '17:05', level: 'error',   msg: 'Auth token refresh failed for user david@mail.com' },
  { time: '16:58', level: 'info',    msg: 'MongoDB backup completed successfully — 2.4MB' },
  { time: '16:44', level: 'info',    msg: 'Session opened: admin@cogn.ai from 192.168.1.42' },
];

// ─── Helpers ─────────────────────────────────────────────────────
function DarkTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 10, padding: '10px 14px', fontSize: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
      <div style={{ fontWeight: 700, marginBottom: 5, color: 'var(--text)' }}>{label}</div>
      {payload.map(p => <div key={p.name} style={{ color: p.color }}>{p.name}: <span style={{ color: 'var(--text)' }}>{p.value}</span></div>)}
    </div>
  );
}

function SectionCard({ title, subtitle, icon: Icon, color = '#f59e0b', action, children }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'rgba(245,158,11,0.02)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: `${color}15`, border: `1px solid ${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={14} color={color} />
          </div>
          <div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{title}</div>
            {subtitle && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{subtitle}</div>}
          </div>
        </div>
        {action}
      </div>
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, unit = '', color = '#f59e0b', sub }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: `1px solid ${color}20`, borderRadius: 14, padding: '18px 20px', transition: 'all 0.2s', position: 'relative', overflow: 'hidden' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 28px ${color}20`; e.currentTarget.style.borderColor = `${color}40`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = `${color}20`; }}>
      <div style={{ position: 'absolute', top: -16, right: -16, width: 70, height: 70, background: `radial-gradient(circle, ${color}12 0%, transparent 70%)`, borderRadius: '50%' }} />
      <div style={{ width: 34, height: 34, borderRadius: 9, background: `${color}12`, border: `1px solid ${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
        <Icon size={15} color={color} />
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif", color: 'var(--text)', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
        {value}<span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', marginLeft: 3 }}>{unit}</span>
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 5 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color, marginTop: 3, fontWeight: 600 }}>{sub}</div>}
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────
export default function AdminDashboard() {
  const { roleUser } = useRole();
  const location = useLocation();
  const navigate = useNavigate();

  // Derive active tab from URL path
  const currentPath = location.pathname.replace(/\/$/, '');
  let activeTab = 'overview';
  if (currentPath.endsWith('/users')) activeTab = 'users';
  else if (currentPath.endsWith('/analytics')) activeTab = 'analytics';
  else if (currentPath.endsWith('/recs')) activeTab = 'recs';
  else if (currentPath.endsWith('/reports')) activeTab = 'reports';

  const handleTabChange = (tabId) => {
    if (tabId === 'overview') navigate('/admin');
    else navigate(`/admin/${tabId}`);
  };

  const [userFilter, setUserFilter] = useState('all');
  const [searchQ, setSearchQ] = useState('');

  const TABS = [
    { id: 'overview',   label: '🏠 Overview' },
    { id: 'users',      label: '👥 Users' },
    { id: 'analytics',  label: '📊 Analytics' },
    { id: 'recs',       label: '🤖 Recommendations' },
    { id: 'reports',    label: '🖥️ System Reports' },
  ];

  const totalAlarms    = ALL_USERS.reduce((s, u) => s + u.alarms, 0);
  const avgSuccess     = Math.round(ALL_USERS.reduce((s, u) => s + u.success, 0) / ALL_USERS.length);
  const activeUsers    = ALL_USERS.filter(u => u.status === 'active').length;
  const avgRecAccuracy = Math.round(recData.reduce((s, r) => s + r.accuracy, 0) / recData.length);

  const filteredUsers = ALL_USERS
    .filter(u => userFilter === 'all' || u.status === userFilter)
    .filter(u => u.name.toLowerCase().includes(searchQ.toLowerCase()) || u.email.toLowerCase().includes(searchQ.toLowerCase()));

  return (
    <AdminLayout>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px' }} className="fade-in">

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 800, color: 'var(--text)', marginBottom: 5 }}>
              🛡️ Welcome, <span style={{ color: '#f59e0b' }}>{roleUser?.name?.split(' ')[0]}</span>
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Managing <strong style={{ color: 'var(--text)' }}>{ALL_USERS.length} users</strong> · Platform uptime <strong style={{ color: '#10b981' }}>99.2%</strong>
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: 10, fontSize: 12, fontWeight: 700, color: '#f43f5e' }}>
              <AlertTriangle size={13} /> 2 Alerts
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, fontSize: 12, fontWeight: 700, color: '#10b981' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px rgba(16,185,129,0.8)' }} />
              Systems OK
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => handleTabChange(tab.id)} style={{
              padding: '7px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'all 0.15s',
              background: activeTab === tab.id ? 'linear-gradient(135deg, rgba(245,158,11,0.28), rgba(217,119,6,0.18))' : 'var(--bg-card)',
              color: activeTab === tab.id ? '#f59e0b' : 'var(--text-muted)',
              outline: activeTab === tab.id ? '1px solid rgba(245,158,11,0.4)' : '1px solid var(--border)',
              boxShadow: activeTab === tab.id ? '0 2px 12px rgba(245,158,11,0.2)' : 'none',
            }}>{tab.label}</button>
          ))}
        </div>

        {/* KPI row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }} className="stats-grid">
          <StatCard icon={Users}        label="Total Users"       value={ALL_USERS.length} color="#f59e0b" sub={`${activeUsers} active`} />
          <StatCard icon={Activity}     label="Total Alarms Set"  value={totalAlarms}       color="#60a5fa" />
          <StatCard icon={CheckCircle2} label="Avg Success Rate"  value={avgSuccess} unit="%" color="#10b981" />
          <StatCard icon={Cpu}          label="ML Model Accuracy" value={avgRecAccuracy} unit="%" color="#a78bfa" sub="Across all types" />
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 16 }} className="two-col-grid">
              <SectionCard title="Platform Sessions This Week" subtitle="Daily sessions, alarms, and puzzle solves" icon={BarChart3} color="#f59e0b">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={platformWeekly} barSize={16} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="rgba(245,158,11,0.08)" strokeDasharray="4 4" />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(245,158,11,0.06)' }} />
                    <Bar dataKey="sessions" name="Sessions" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="solved"   name="Puzzles solved" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="newUsers" name="New users" fill="#a78bfa" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </SectionCard>

              {/* User status pie */}
              <SectionCard title="User Status Distribution" subtitle="Active vs inactive vs suspended" icon={Users} color="#60a5fa">
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie data={statusDist} cx="50%" cy="50%" outerRadius={55} dataKey="value" strokeWidth={0}>
                      {statusDist.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip formatter={(v, n) => [`${v} users`, n]} contentStyle={{ background: 'var(--bg-card)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                  {statusDist.map(d => (
                    <div key={d.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <div style={{ width: 7, height: 7, borderRadius: 2, background: d.color }} />
                        <span style={{ color: 'var(--text-secondary)' }}>{d.name}</span>
                      </div>
                      <span style={{ fontWeight: 700, color: 'var(--text)' }}>{d.value} users</span>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>

            {/* User growth trend */}
            <SectionCard title="User Growth" subtitle="Monthly registered users" icon={TrendingUp} color="#a78bfa">
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={userGrowth} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#a78bfa" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="rgba(167,139,250,0.08)" strokeDasharray="4 4" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<DarkTooltip />} />
                  <Area type="monotone" dataKey="users" name="Users" stroke="#a78bfa" strokeWidth={2.5} fill="url(#growthGrad)" dot={{ r: 5, fill: '#a78bfa', strokeWidth: 0 }} activeDot={{ r: 7 }} />
                </AreaChart>
              </ResponsiveContainer>
            </SectionCard>
          </div>
        )}

        {/* ── USERS TAB ── */}
        {activeTab === 'users' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <SectionCard title="User Management" subtitle={`${ALL_USERS.length} registered users`} icon={Users} color="#60a5fa"
              action={
                <div style={{ display: 'flex', gap: 8 }}>
                  {['all', 'active', 'inactive', 'suspended'].map(f => (
                    <button key={f} onClick={() => setUserFilter(f)} style={{
                      padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.12s',
                      background: userFilter === f ? 'rgba(96,165,250,0.2)' : 'transparent',
                      color: userFilter === f ? '#60a5fa' : 'var(--text-muted)',
                      outline: userFilter === f ? '1px solid rgba(96,165,250,0.3)' : '1px solid transparent',
                    }}>{f}</button>
                  ))}
                </div>
              }
            >
              {/* Search */}
              <div style={{ marginBottom: 14 }}>
                <input
                  placeholder="Search users by name or email…"
                  value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                  style={{ width: '100%', padding: '9px 14px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 9, fontSize: 13, color: 'var(--text)', outline: 'none', fontFamily: 'inherit', transition: 'all 0.2s' }}
                  onFocus={e => { e.target.style.borderColor = '#f59e0b'; e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.15)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>User</th><th>Email</th><th>Alarms</th><th>Streak</th><th>Success</th><th>Last Active</th><th>Status</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(u => {
                      const sc = u.status === 'active' ? { bg: 'rgba(16,185,129,0.1)', color: '#10b981', border: 'rgba(16,185,129,0.2)' }
                        : u.status === 'inactive' ? { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: 'rgba(245,158,11,0.2)' }
                        : { bg: 'rgba(244,63,94,0.08)', color: '#f43f5e', border: 'rgba(244,63,94,0.2)' };
                      return (
                        <tr key={u.id}>
                          <td style={{ fontWeight: 700, color: 'var(--text)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                                {u.name.charAt(0)}
                              </div>
                              {u.name}
                            </div>
                          </td>
                          <td style={{ fontSize: 12 }}>{u.email}</td>
                          <td style={{ fontVariantNumeric: 'tabular-nums' }}>{u.alarms}</td>
                          <td>🔥 {u.streak}d</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <div style={{ width: 50, height: 4, background: 'var(--bg-active)', borderRadius: 2, overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${u.success}%`, background: u.success > 80 ? '#10b981' : u.success > 65 ? '#fbbf24' : '#f43f5e', borderRadius: 2 }} />
                              </div>
                              <span style={{ fontSize: 11, fontWeight: 600 }}>{u.success}%</span>
                            </div>
                          </td>
                          <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{u.lastActive}</td>
                          <td>
                            <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, textTransform: 'capitalize' }}>
                              {u.status}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 5 }}>
                              <button title="Suspend" style={{ width: 26, height: 26, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b', transition: 'all 0.12s' }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.18)'; }} onMouseLeave={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.08)'; }}>
                                <AlertTriangle size={11} />
                              </button>
                              <button title="Delete" style={{ width: 26, height: 26, background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.15)', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f43f5e', transition: 'all 0.12s' }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(244,63,94,0.16)'; }} onMouseLeave={e => { e.currentTarget.style.background = 'rgba(244,63,94,0.06)'; }}>
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filteredUsers.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: 13 }}>No users match your search.</div>
                )}
              </div>
            </SectionCard>
          </div>
        )}

        {/* ── ANALYTICS TAB ── */}
        {activeTab === 'analytics' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }} className="grid-1-on-mobile">
              {[
                { label: 'Total Sessions This Week', value: platformWeekly.reduce((s, d) => s + d.sessions, 0), icon: Activity, color: '#f59e0b' },
                { label: 'Puzzles Solved This Week', value: platformWeekly.reduce((s, d) => s + d.solved, 0),   icon: CheckCircle2, color: '#10b981' },
                { label: 'New Users This Week',       value: platformWeekly.reduce((s, d) => s + d.newUsers, 0), icon: Users, color: '#a78bfa' },
              ].map(c => (
                <StatCard key={c.label} icon={c.icon} label={c.label} value={c.value} color={c.color} />
              ))}
            </div>

            <SectionCard title="Platform Analytics" subtitle="Detailed session and engagement metrics" icon={BarChart3} color="#f59e0b">
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={platformWeekly} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="rgba(245,158,11,0.08)" strokeDasharray="4 4" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<DarkTooltip />} />
                  <Line type="monotone" dataKey="sessions" name="Sessions" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4, fill: '#f59e0b', strokeWidth: 0 }} activeDot={{ r: 7 }} />
                  <Line type="monotone" dataKey="alarms"   name="Alarms"   stroke="#60a5fa" strokeWidth={2}   dot={{ r: 4, fill: '#60a5fa', strokeWidth: 0 }} activeDot={{ r: 7 }} />
                  <Line type="monotone" dataKey="solved"   name="Solved"   stroke="#10b981" strokeWidth={2}   dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }} activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
            </SectionCard>
          </div>
        )}

        {/* ── RECOMMENDATIONS TAB ── */}
        {activeTab === 'recs' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <SectionCard title="Recommendation Monitoring" subtitle="AI recommendation types served and their accuracy" icon={Cpu} color="#a78bfa">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={recData} layout="vertical" margin={{ top: 4, right: 40, left: 10, bottom: 0 }}>
                  <CartesianGrid horizontal={false} stroke="rgba(167,139,250,0.08)" strokeDasharray="4 4" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="type" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={90} />
                  <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(167,139,250,0.06)' }} />
                  <Bar dataKey="count"    name="Times served"  fill="rgba(167,139,250,0.4)" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="accuracy" name="Accuracy %" fill="#a78bfa" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </SectionCard>

            <SectionCard title="Model Performance Summary" subtitle="AI recommendation accuracy by puzzle type" icon={Zap} color="#10b981">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                {recData.map(r => {
                  const color = r.accuracy >= 85 ? '#10b981' : r.accuracy >= 70 ? '#fbbf24' : '#f43f5e';
                  return (
                    <div key={r.type} style={{ background: 'var(--bg-surface)', border: `1px solid ${color}18`, borderRadius: 12, padding: '14px 16px' }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)', marginBottom: 8 }}>{r.type}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <div style={{ flex: 1, height: 5, background: 'var(--bg-active)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${r.accuracy}%`, background: color, borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 800, color, fontFamily: "'Space Grotesk', sans-serif" }}>{r.accuracy}%</span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Served {r.count} times</div>
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          </div>
        )}

        {/* ── SYSTEM REPORTS TAB ── */}
        {activeTab === 'reports' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Service health */}
            <SectionCard title="System Reports" subtitle="Service health, uptime and latency" icon={Server} color="#f43f5e"
              action={
                <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8, fontSize: 12, fontWeight: 700, color: '#f59e0b', cursor: 'pointer', fontFamily: 'inherit' }}>
                  <RefreshCw size={12} /> Refresh
                </button>
              }
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {SYS_SERVICES.map(s => {
                  const statusColor = s.status === 'healthy' ? '#10b981' : '#f59e0b';
                  const SIcon = s.icon;
                  return (
                    <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 16px', background: 'var(--bg-surface)', border: `1px solid ${statusColor}18`, borderRadius: 12, transition: 'all 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = `${statusColor}30`; }} onMouseLeave={e => { e.currentTarget.style.borderColor = `${statusColor}18`; }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: `${statusColor}15`, border: `1px solid ${statusColor}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <SIcon size={16} color={statusColor} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', marginBottom: 3 }}>{s.name}</div>
                        <div style={{ display: 'flex', gap: 14, fontSize: 12, color: 'var(--text-muted)' }}>
                          <span>Uptime: <strong style={{ color: 'var(--text)' }}>{s.uptime}</strong></span>
                          <span>Latency: <strong style={{ color: 'var(--text)' }}>{s.latency}</strong></span>
                        </div>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: `${statusColor}12`, color: statusColor, border: `1px solid ${statusColor}25`, textTransform: 'capitalize', flexShrink: 0 }}>
                        {s.status === 'healthy' ? '✓ Healthy' : '⚠ Warning'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </SectionCard>

            {/* System stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }} className="grid-1-on-mobile">
              {[
                { label: 'Active Sessions',   value: 7,     unit: '',  color: '#60a5fa', icon: Activity },
                { label: 'DB Storage Used',   value: '2.4', unit: 'MB', color: '#a78bfa', icon: Database },
                { label: 'API Requests Today', value: 342,   unit: '',  color: '#f59e0b', icon: Zap },
              ].map(c => <StatCard key={c.label} icon={c.icon} label={c.label} value={c.value} unit={c.unit} color={c.color} />)}
            </div>

            {/* Activity logs */}
            <SectionCard title="Recent Activity Logs" subtitle="Latest platform events" icon={FileText} color="#60a5fa">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {RECENT_LOGS.map((log, i) => {
                  const lc = log.level === 'error' ? '#f43f5e' : log.level === 'warning' ? '#f59e0b' : '#10b981';
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 14px', background: `${lc}06`, border: `1px solid ${lc}15`, borderRadius: 9, fontFamily: 'monospace' }}>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>{log.time}</span>
                      <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 5, background: `${lc}15`, color: lc, textTransform: 'uppercase', flexShrink: 0 }}>{log.level}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{log.msg}</span>
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          </div>
        )}

      </div>
      <style>{`
        @media (max-width: 800px) { .stats-grid { grid-template-columns: repeat(2,1fr) !important; } .two-col-grid { grid-template-columns: 1fr !important; } .grid-1-on-mobile { grid-template-columns: 1fr !important; } }
      `}</style>
    </AdminLayout>
  );
}
