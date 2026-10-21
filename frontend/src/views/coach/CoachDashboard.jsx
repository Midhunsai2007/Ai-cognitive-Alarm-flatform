import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CoachLayout } from './CoachLayout';
import { useRole } from '../../context/RoleContext';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from 'recharts';
import { Users, TrendingUp, Moon, Activity, Clock, CheckCircle2, Zap, Heart, Star } from 'lucide-react';

// ─── Mock Data ───────────────────────────────────────────────────
const MOCK_USERS = [
  { id: 1, name: 'Alex Ramos',     streak: 12, avgSolve: 18.4, alarms: 24, success: 83, habit: 90, wakeTime: '06:45', progress: 88 },
  { id: 2, name: 'Priya Singh',    streak: 7,  avgSolve: 22.1, alarms: 18, success: 72, habit: 75, wakeTime: '07:10', progress: 71 },
  { id: 3, name: 'James Li',       streak: 21, avgSolve: 14.8, alarms: 31, success: 94, habit: 96, wakeTime: '06:30', progress: 95 },
  { id: 4, name: 'Sara Khan',      streak: 3,  avgSolve: 28.6, alarms: 10, success: 60, habit: 55, wakeTime: '08:00', progress: 52 },
  { id: 5, name: 'Tom Nguyen',     streak: 9,  avgSolve: 19.2, alarms: 20, success: 78, habit: 80, wakeTime: '07:00', progress: 79 },
  { id: 6, name: 'Maria Costa',    streak: 15, avgSolve: 16.5, alarms: 27, success: 89, habit: 88, wakeTime: '06:50', progress: 87 },
  { id: 7, name: 'David Park',     streak: 5,  avgSolve: 25.3, alarms: 14, success: 65, habit: 63, wakeTime: '07:30', progress: 62 },
  { id: 8, name: 'Lena Mueller',   streak: 18, avgSolve: 15.9, alarms: 29, success: 91, habit: 93, wakeTime: '06:40', progress: 92 },
];

const weekBehavior = [
  { day: 'Mon', activeUsers: 8, avgSolveTime: 19.2, puzzlesCompleted: 14 },
  { day: 'Tue', activeUsers: 7, avgSolveTime: 21.4, puzzlesCompleted: 11 },
  { day: 'Wed', activeUsers: 8, avgSolveTime: 18.7, puzzlesCompleted: 16 },
  { day: 'Thu', activeUsers: 6, avgSolveTime: 23.1, puzzlesCompleted: 10 },
  { day: 'Fri', activeUsers: 8, avgSolveTime: 17.8, puzzlesCompleted: 18 },
  { day: 'Sat', activeUsers: 5, avgSolveTime: 20.5, puzzlesCompleted: 9  },
  { day: 'Sun', activeUsers: 4, avgSolveTime: 22.3, puzzlesCompleted: 7  },
];

const habitData = [
  { week: 'Wk 1', high: 3, med: 3, low: 2 },
  { week: 'Wk 2', high: 4, med: 2, low: 2 },
  { week: 'Wk 3', high: 5, med: 2, low: 1 },
  { week: 'Wk 4', high: 5, med: 2, low: 1 },
  { week: 'Wk 5', high: 6, med: 1, low: 1 },
  { week: 'Wk 6', high: 6, med: 2, low: 0 },
];

const sleepData = [
  { day: 'Mon', earlyWake: 4, onTime: 3, late: 1 },
  { day: 'Tue', earlyWake: 3, onTime: 3, late: 2 },
  { day: 'Wed', earlyWake: 5, onTime: 2, late: 1 },
  { day: 'Thu', earlyWake: 3, onTime: 4, late: 1 },
  { day: 'Fri', earlyWake: 4, onTime: 3, late: 1 },
  { day: 'Sat', earlyWake: 2, onTime: 2, late: 1 },
  { day: 'Sun', earlyWake: 2, onTime: 2, late: 0 },
];

const wakeTimeDist = [
  { label: 'Before 6am', value: 2,  color: '#818cf8' },
  { label: '6–7am',      value: 5,  color: '#10b981' },
  { label: '7–8am',      value: 3,  color: '#60a5fa' },
  { label: 'After 8am',  value: 2,  color: '#f59e0b' },
];

const puzzleTypeDist = [
  { name: 'Math',    value: 38, color: '#60a5fa' },
  { name: 'Pattern', value: 24, color: '#a78bfa' },
  { name: 'Memory',  value: 18, color: '#f472b6' },
  { name: 'Stroop',  value: 12, color: '#34d399' },
  { name: 'Word',    value: 8,  color: '#fbbf24' },
];

const radarData = [
  { metric: 'Solve Speed',   value: 78 },
  { metric: 'Habit Score',   value: 82 },
  { metric: 'Consistency',   value: 74 },
  { metric: 'Accuracy',      value: 88 },
  { metric: 'Streak Avg',    value: 70 },
  { metric: 'Engagement',    value: 85 },
];

// ─── Helpers ─────────────────────────────────────────────────────
function DarkTooltip({ active, payload, label, unit = '' }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, padding: '10px 14px', fontSize: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
      <div style={{ fontWeight: 700, marginBottom: 5, color: 'var(--text)', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color, fontWeight: 500 }}>{p.name}: <span style={{ color: 'var(--text)' }}>{p.value}{unit}</span></div>
      ))}
    </div>
  );
}

function SectionCard({ title, subtitle, icon: Icon, color = '#10b981', action, children }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'rgba(16,185,129,0.02)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: `${color}18`, border: `1px solid ${color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={14} color={color} />
          </div>
          <div>
            <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{title}</div>
            {subtitle && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{subtitle}</div>}
          </div>
        </div>
        {action}
      </div>
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, unit = '', color = '#10b981', sub }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: `1px solid ${color}20`, borderRadius: 14, padding: '18px 20px', transition: 'all 0.2s', position: 'relative', overflow: 'hidden' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 28px ${color}20`; e.currentTarget.style.borderColor = `${color}40`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = `${color}20`; }}>
      <div style={{ position: 'absolute', top: -16, right: -16, width: 70, height: 70, background: `radial-gradient(circle, ${color}15 0%, transparent 70%)`, borderRadius: '50%' }} />
      <div style={{ width: 34, height: 34, borderRadius: 9, background: `${color}15`, border: `1px solid ${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
        <Icon size={15} color={color} />
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: 'var(--text)', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
        {value}<span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', marginLeft: 3 }}>{unit}</span>
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 5 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color, marginTop: 3, fontWeight: 600 }}>{sub}</div>}
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────
export default function CoachDashboard() {
  const { roleUser } = useRole();
  const location = useLocation();
  const navigate = useNavigate();

  // Derive active tab from URL path
  const currentPath = location.pathname.replace(/\/$/, '');
  let activeTab = 'overview';
  if (currentPath.endsWith('/behavior')) activeTab = 'behavior';
  else if (currentPath.endsWith('/habits')) activeTab = 'habits';
  else if (currentPath.endsWith('/sleep')) activeTab = 'sleep';
  else if (currentPath.endsWith('/progress')) activeTab = 'progress';

  const handleTabChange = (tabId) => {
    if (tabId === 'overview') navigate('/coach');
    else navigate(`/coach/${tabId}`);
  };

  const avgStreak = Math.round(MOCK_USERS.reduce((s, u) => s + u.streak, 0) / MOCK_USERS.length);
  const avgSuccess = Math.round(MOCK_USERS.reduce((s, u) => s + u.success, 0) / MOCK_USERS.length);
  const avgHabit = Math.round(MOCK_USERS.reduce((s, u) => s + u.habit, 0) / MOCK_USERS.length);
  const avgSolve = (MOCK_USERS.reduce((s, u) => s + u.avgSolve, 0) / MOCK_USERS.length).toFixed(1);

  const TABS = [
    { id: 'overview',  label: '📊 Overview' },
    { id: 'behavior',  label: '🧠 Behavior' },
    { id: 'habits',    label: '✅ Habits' },
    { id: 'sleep',     label: '🌙 Sleep' },
    { id: 'progress',  label: '📈 Progress' },
  ];

  return (
    <CoachLayout>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px' }} className="fade-in">

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: 24, fontWeight: 800, color: 'var(--text)', marginBottom: 5 }}>
              🌿 Good day, <span style={{ color: '#10b981' }}>{roleUser?.name?.split(' ')[0]}</span>
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Monitoring <strong style={{ color: 'var(--text)' }}>{MOCK_USERS.length} users</strong> · All systems healthy
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, fontSize: 12, fontWeight: 600, color: '#10b981' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px rgba(16,185,129,0.7)', animation: 'pulse-glow 2s infinite' }} />
            Live Data · Updated just now
          </div>
        </div>

        {/* Tab navigation */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => handleTabChange(tab.id)} style={{
              padding: '7px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'all 0.15s',
              background: activeTab === tab.id ? 'linear-gradient(135deg, rgba(16,185,129,0.3), rgba(5,150,105,0.2))' : 'var(--bg-card)',
              color: activeTab === tab.id ? '#10b981' : 'var(--text-muted)',
              outline: activeTab === tab.id ? '1px solid rgba(16,185,129,0.4)' : '1px solid var(--border)',
              boxShadow: activeTab === tab.id ? '0 2px 12px rgba(16,185,129,0.2)' : 'none',
            }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── KPI Stats ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }} className="stats-grid">
          <StatCard icon={Users}        label="Active Users"     value={MOCK_USERS.length}  color="#10b981" sub="All monitored" />
          <StatCard icon={TrendingUp}   label="Avg Habit Score"  value={avgHabit}  unit="%" color="#a78bfa" sub={`${avgStreak}d avg streak`} />
          <StatCard icon={CheckCircle2} label="Avg Success Rate" value={avgSuccess} unit="%" color="#60a5fa" />
          <StatCard icon={Clock}        label="Avg Solve Time"   value={avgSolve}  unit="s" color="#fbbf24" sub="Across all puzzles" />
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 16 }} className="two-col-grid">
              {/* Weekly activity */}
              <SectionCard title="Weekly Active Users" subtitle="Daily engagement across the platform" icon={Activity} color="#10b981">
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={weekBehavior} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="coachAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#10b981" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="rgba(16,185,129,0.08)" strokeDasharray="4 4" />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<DarkTooltip />} />
                    <Area type="monotone" dataKey="activeUsers" name="Active users" stroke="#10b981" strokeWidth={2} fill="url(#coachAreaGrad)"
                      dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </SectionCard>

              {/* Puzzle type distribution */}
              <SectionCard title="Puzzle Type Distribution" subtitle="Most popular cognitive challenges" icon={Zap} color="#a78bfa">
                <ResponsiveContainer width="100%" height={130}>
                  <PieChart>
                    <Pie data={puzzleTypeDist} cx="50%" cy="50%" innerRadius={36} outerRadius={58} dataKey="value" strokeWidth={0}>
                      {puzzleTypeDist.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip formatter={(v, n) => [`${v}%`, n]} contentStyle={{ background: 'var(--bg-card)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 8 }}>
                  {puzzleTypeDist.map(d => (
                    <div key={d.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 7, height: 7, borderRadius: 2, background: d.color, flexShrink: 0 }} />
                        <span style={{ color: 'var(--text-secondary)' }}>{d.name}</span>
                      </div>
                      <span style={{ fontWeight: 700, color: 'var(--text)' }}>{d.value}%</span>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>

            {/* Radar — platform skill profile */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 3fr', gap: 16 }} className="two-col-grid">
              <SectionCard title="Platform Skill Radar" subtitle="Average across all users" icon={Star} color="#fbbf24">
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart cx="50%" cy="50%" outerRadius={80} data={radarData}>
                    <PolarGrid stroke="rgba(16,185,129,0.12)" />
                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                    <Radar name="Score" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.18} strokeWidth={2} />
                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, fontSize: 12 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </SectionCard>

              {/* Top performers */}
              <SectionCard title="Top Performers" subtitle="Ranked by habit score" icon={Heart} color="#10b981">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[...MOCK_USERS].sort((a, b) => b.habit - a.habit).slice(0, 5).map((u, i) => (
                    <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'var(--bg-surface)', borderRadius: 10, border: '1px solid var(--border)', transition: 'all 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(16,185,129,0.2)'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: i === 0 ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' : i === 1 ? 'linear-gradient(135deg, #94a3b8, #64748b)' : i === 2 ? 'linear-gradient(135deg, #c97c2b, #a16207)' : 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                        {i < 3 ? ['🥇', '🥈', '🥉'][i] : u.name.charAt(0)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>🔥 {u.streak}d streak · ⏱ {u.avgSolve}s avg</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: '#10b981', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>{u.habit}%</span>
                        <div style={{ width: 60, height: 4, background: 'var(--bg-active)', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${u.habit}%`, background: '#10b981', borderRadius: 2 }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>
          </div>
        )}

        {/* ── BEHAVIOR TAB ── */}
        {activeTab === 'behavior' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <SectionCard title="User Behavior Insights" subtitle="Daily puzzle completion and solve time across the week" icon={Activity} color="#60a5fa">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={weekBehavior} barSize={22} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="rgba(96,165,250,0.08)" strokeDasharray="4 4" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(96,165,250,0.06)' }} />
                  <Bar dataKey="puzzlesCompleted" name="Puzzles completed" fill="#60a5fa" radius={[5, 5, 0, 0]} />
                  <Bar dataKey="activeUsers" name="Active users" fill="rgba(96,165,250,0.3)" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </SectionCard>

            <SectionCard title="Avg Solve Time Trend" subtitle="How quickly users solve cognitive puzzles over the week" icon={Clock} color="#fbbf24">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={weekBehavior} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="rgba(245,158,11,0.08)" strokeDasharray="4 4" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={v => `${v}s`} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<DarkTooltip unit="s" />} />
                  <Line type="monotone" dataKey="avgSolveTime" name="Avg solve time" stroke="#fbbf24" strokeWidth={2.5} dot={{ r: 5, fill: '#fbbf24', strokeWidth: 0 }} activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
            </SectionCard>

            {/* User table */}
            <SectionCard title="Individual User Behavior" subtitle="Detailed metrics per user" icon={Users} color="#10b981">
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>User</th><th>Avg Solve Time</th><th>Alarms Set</th><th>Success Rate</th><th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_USERS.map(u => (
                      <tr key={u.id}>
                        <td style={{ fontWeight: 600, color: 'var(--text)' }}>{u.name}</td>
                        <td style={{ fontVariantNumeric: 'tabular-nums', color: u.avgSolve < 20 ? '#10b981' : u.avgSolve < 25 ? '#fbbf24' : '#f43f5e' }}>{u.avgSolve}s</td>
                        <td>{u.alarms}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ flex: 1, height: 5, background: 'var(--bg-active)', borderRadius: 3, overflow: 'hidden', maxWidth: 80 }}>
                              <div style={{ height: '100%', width: `${u.success}%`, background: u.success > 80 ? '#10b981' : u.success > 65 ? '#fbbf24' : '#f43f5e', borderRadius: 3 }} />
                            </div>
                            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)' }}>{u.success}%</span>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: u.success > 80 ? 'rgba(16,185,129,0.1)' : u.success > 65 ? 'rgba(245,158,11,0.1)' : 'rgba(244,63,94,0.1)', color: u.success > 80 ? '#10b981' : u.success > 65 ? '#f59e0b' : '#f43f5e' }}>
                            {u.success > 80 ? 'Excellent' : u.success > 65 ? 'Good' : 'Needs help'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          </div>
        )}

        {/* ── HABITS TAB ── */}
        {activeTab === 'habits' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <SectionCard title="Habit Adherence Analytics" subtitle="Weekly breakdown of user consistency tiers" icon={TrendingUp} color="#a78bfa">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={habitData} barSize={32} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="rgba(167,139,250,0.08)" strokeDasharray="4 4" />
                  <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(167,139,250,0.06)' }} />
                  <Bar dataKey="high" name="High adherence (>85%)" stackId="a" fill="#10b981" />
                  <Bar dataKey="med"  name="Medium adherence (60–85%)" stackId="a" fill="#fbbf24" />
                  <Bar dataKey="low"  name="Low adherence (<60%)" stackId="a" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
                {[{ label: 'High adherence', color: '#10b981' }, { label: 'Medium adherence', color: '#fbbf24' }, { label: 'Low adherence', color: '#f43f5e' }].map(l => (
                  <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-secondary)' }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: l.color }} /> {l.label}
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* User habit scores */}
            <SectionCard title="Individual Habit Scores" subtitle="Each user's habit adherence percentage" icon={Heart} color="#10b981">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                {[...MOCK_USERS].sort((a, b) => b.habit - a.habit).map(u => {
                  const color = u.habit >= 85 ? '#10b981' : u.habit >= 65 ? '#fbbf24' : '#f43f5e';
                  return (
                    <div key={u.id} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)', marginBottom: 6 }}>{u.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <div style={{ flex: 1, height: 6, background: 'var(--bg-active)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${u.habit}%`, background: color, borderRadius: 3, transition: 'width 0.8s ease' }} />
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 800, color, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>{u.habit}%</span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>🔥 {u.streak}d streak · Wake: {u.wakeTime}</div>
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          </div>
        )}

        {/* ── SLEEP TAB ── */}
        {activeTab === 'sleep' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }} className="two-col-grid">
              <SectionCard title="Sleep Trend Reports" subtitle="Wake time distribution across users per day" icon={Moon} color="#818cf8">
                <ResponsiveContainer width="100%" height={230}>
                  <BarChart data={sleepData} barSize={26} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="rgba(129,140,248,0.08)" strokeDasharray="4 4" />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(129,140,248,0.06)' }} />
                    <Bar dataKey="earlyWake" name="Early (<6:30am)" stackId="a" fill="#818cf8" />
                    <Bar dataKey="onTime"    name="On-time (6:30–7:30am)" stackId="a" fill="#10b981" />
                    <Bar dataKey="late"      name="Late (>7:30am)" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </SectionCard>

              {/* Wake time dist */}
              <SectionCard title="Wake Time Distribution" subtitle="User spread across time slots" icon={Clock} color="#60a5fa">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 4 }}>
                  {wakeTimeDist.map(w => (
                    <div key={w.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                        <span style={{ color: 'var(--text-secondary)' }}>{w.label}</span>
                        <span style={{ fontWeight: 700, color: w.color }}>{w.value} users</span>
                      </div>
                      <div style={{ height: 6, background: 'var(--bg-active)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${(w.value / 12) * 100}%`, background: w.color, borderRadius: 3 }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 16, padding: '10px 12px', background: 'rgba(129,140,248,0.06)', border: '1px solid rgba(129,140,248,0.15)', borderRadius: 10, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  💡 <strong style={{ color: '#818cf8' }}>Insight:</strong> 5/8 users wake between 6–7am — the optimal cognitive alertness window.
                </div>
              </SectionCard>
            </div>

            {/* User wake schedule */}
            <SectionCard title="Individual Wake Schedules" subtitle="Scheduled alarm times per user" icon={Users} color="#818cf8">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
                {MOCK_USERS.map(u => {
                  const hour = parseInt(u.wakeTime.split(':')[0]);
                  const isOptimal = hour >= 6 && hour < 7;
                  return (
                    <div key={u.id} style={{ background: 'var(--bg-surface)', border: `1px solid ${isOptimal ? 'rgba(16,185,129,0.2)' : 'var(--border)'}`, borderRadius: 10, padding: '12px 14px', textAlign: 'center' }}>
                      <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: isOptimal ? '#10b981' : 'var(--text)', fontVariantNumeric: 'tabular-nums', marginBottom: 4 }}>
                        {u.wakeTime}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 3 }}>{u.name.split(' ')[0]}</div>
                      {isOptimal && <span style={{ fontSize: 10, fontWeight: 700, color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '2px 7px', borderRadius: 10 }}>✓ Optimal</span>}
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          </div>
        )}

        {/* ── PROGRESS TAB ── */}
        {activeTab === 'progress' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <SectionCard title="Progress Monitoring" subtitle="Holistic user progress tracking" icon={TrendingUp} color="#10b981">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
                {[...MOCK_USERS].sort((a, b) => b.progress - a.progress).map((u, i) => {
                  const color = u.progress >= 85 ? '#10b981' : u.progress >= 65 ? '#fbbf24' : '#f43f5e';
                  const label = u.progress >= 85 ? 'Excellent' : u.progress >= 65 ? 'On track' : 'Needs support';
                  return (
                    <div key={u.id} style={{ background: 'var(--bg-surface)', border: `1px solid ${color}20`, borderRadius: 14, padding: '18px 18px', transition: 'all 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = `${color}40`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = `${color}20`; e.currentTarget.style.transform = 'none'; }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg, ${color}50, ${color}30)`, border: `1px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, color, flexShrink: 0 }}>
                          {u.name.charAt(0)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{u.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                            🔥 {u.streak}d · ⏱ {u.avgSolve}s · ✅ {u.success}%
                          </div>
                        </div>
                        <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color }}>{u.progress}%</div>
                      </div>

                      {/* Progress bar */}
                      <div style={{ height: 7, background: 'var(--bg-active)', borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}>
                        <div style={{ height: '100%', width: `${u.progress}%`, background: `linear-gradient(90deg, ${color}, ${color}bb)`, borderRadius: 4, transition: 'width 0.8s ease' }} />
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Habit: {u.habit}% · Alarms: {u.alarms}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: `${color}15`, color, border: `1px solid ${color}30` }}>{label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </SectionCard>

            {/* Coach recommendations */}
            <SectionCard title="Coach Action Items" subtitle="Users that need your attention" icon={Heart} color="#f43f5e">
              {MOCK_USERS.filter(u => u.progress < 70).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#10b981', fontSize: 14 }}>
                  🎉 All users are on track — great work!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {MOCK_USERS.filter(u => u.progress < 70).map(u => (
                    <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'rgba(244,63,94,0.05)', border: '1px solid rgba(244,63,94,0.15)', borderRadius: 10 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f43f5e', flexShrink: 0, animation: 'pulse-glow 2s infinite' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>{u.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>Progress: {u.progress}% · Habit: {u.habit}% · Streak: {u.streak}d</div>
                      </div>
                      <button style={{ padding: '5px 12px', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: 8, fontSize: 11, fontWeight: 700, color: '#f43f5e', cursor: 'pointer', fontFamily: 'inherit' }}>
                        Send Nudge
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>
        )}

      </div>
      <style>{`
        @keyframes pulse-glow { 0%,100% { box-shadow: 0 0 4px rgba(16,185,129,0.4); } 50% { box-shadow: 0 0 12px rgba(16,185,129,0.8); } }
        @media (max-width: 800px) { .stats-grid { grid-template-columns: repeat(2,1fr) !important; } .two-col-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </CoachLayout>
  );
}
