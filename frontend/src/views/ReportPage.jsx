import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { analyticsAPI, historyAPI, alarmAPI, aiAPI } from '../services/api';
import { generateProfessionalPDF } from '../utils/pdfGenerator';
import {
  FileDown, Brain, Flame, CheckCircle2, Clock, BarChart3,
  Award, TrendingUp, Target, Sparkles, RefreshCw, Shield,
} from 'lucide-react';

/* Difficulty tiers */
const TIERS = [
  { id: 'beginner', title: 'Beginner', color: '#2c5e3b', streakReq: '0-1 days',  solveReq: '> 22s' },
  { id: 'easy',     title: 'Easy',     color: '#5c4342', streakReq: '2-3 days',  solveReq: '18-22s' },
  { id: 'medium',   title: 'Medium',   color: '#b87414', streakReq: '4-6 days',  solveReq: '14-18s' },
  { id: 'hard',     title: 'Hard',     color: '#8c3329', streakReq: '7-10 days', solveReq: '10-14s' },
  { id: 'expert',   title: 'Expert',   color: '#581c87', streakReq: '11+ days',  solveReq: '< 10s' },
];

const PUZZLE_LABELS = {
  math: 'Math', pattern: 'Pattern Memory',
  memory: 'Memory Flip', stroop: 'Stroop Color', word: 'Word Scramble',
};

/* PDF Builder delegating to Executive Report Generator */
async function buildPDF(args) {
  return generateProfessionalPDF(args);
}

/* ─── Main Page Component ─── */
export default function ReportPage() {
  const { user } = useAuth();
  const [logs, setLogs]             = useState([]);
  const [alarms, setAlarms]         = useState([]);
  const [aiReadiness, setAiReadiness] = useState(null);
  const [aiRecommendation, setAiRecommendation] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [generating, setGenerating] = useState(false);
  const [done, setDone]             = useState(false);

  useEffect(() => {
    Promise.all([
      historyAPI.getHistory().catch(() => []),
      alarmAPI.getAlarms().catch(() => []),
      analyticsAPI.getPrediction().catch(() => null),
      aiAPI.getRecommendation().catch(() => null),
    ]).then(([hLogs, als, pred, rec]) => {
      setLogs(Array.isArray(hLogs) ? hLogs : []);
      setAlarms(Array.isArray(als) ? als : []);
      if (pred) setAiReadiness(pred);
      if (rec) setAiRecommendation(rec);
      setLoading(false);
    });
  }, []);

  const streak = user?.streakCount || 0;
  const totalAlarms = user?.totalAlarms || alarms.length || 1;
  const successWakes = user?.successfulWakes || (streak > 0 ? streak : 1);
  const successRate = Math.min(100, Math.round((successWakes / Math.max(1, totalAlarms)) * 100));

  const solveTimesList = useMemo(() => {
    let list = [];
    if (user?.solveTimes?.length > 0)
      list = user.solveTimes.map(t => typeof t === 'object' ? t.seconds : parseFloat(t)).filter(Boolean);
    if (!list.length && logs.length > 0)
      list = logs.filter(l => l.solveTime && l.solveTime !== '--')
                 .map(l => parseFloat(String(l.solveTime).replace('s', ''))).filter(Boolean);
    return list.length ? list : [18, 16, 14];
  }, [user, logs]);

  const avgSolveTime = useMemo(() =>
    Math.round((solveTimesList.reduce((a, b) => a + b, 0) / solveTimesList.length) * 10) / 10,
  [solveTimesList]);

  const tierIndex = useMemo(() => {
    if (streak >= 11 || (streak >= 8 && avgSolveTime < 10)) return 4; // Expert
    if (streak >= 7  || (streak >= 5 && avgSolveTime < 14)) return 3; // Hard
    if (streak >= 4  || (streak >= 3 && avgSolveTime < 18)) return 2; // Medium
    if (streak >= 2  || avgSolveTime < 22) return 1;                  // Easy
    return 0;                                                         // Beginner
  }, [streak, avgSolveTime]);

  const tier = TIERS[tierIndex];
  const successCount = logs.filter(l => l.status === 'Success').length;
  const snoozedCount = logs.length - successCount;
  const bestStreak   = Math.max(user?.bestStreak || 0, streak);

  const STATS = [
    { icon: Flame,        label: 'Current Streak',   value: streak + ' days',   color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
    { icon: CheckCircle2, label: 'Success Rate',      value: successRate + '%',  color: '#432f2e', bg: 'rgba(67, 47, 46, 0.06)' },
    { icon: Clock,        label: 'Avg Solve Time',    value: avgSolveTime + 's', color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
    { icon: BarChart3,    label: 'Total Alarms',      value: totalAlarms,        color: '#68504f', bg: 'rgba(67, 47, 46, 0.06)'  },
    { icon: Award,        label: 'Best Streak',       value: bestStreak + ' days', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)' },
    { icon: Target,       label: 'Puzzles Solved',    value: successCount,       color: '#5c4342', bg: 'rgba(67, 47, 46, 0.06)'  },
    { icon: TrendingUp,   label: 'Snoozed',           value: snoozedCount,       color: '#5c3e38', bg: 'rgba(67, 47, 46, 0.06)'   },
    { icon: Brain,        label: 'Difficulty Level',  value: tier.title,         color: tier.color, bg: tier.color + '18'      },
  ];

  const handleDownload = async () => {
    setGenerating(true);
    setDone(false);
    try {
      await buildPDF({
        user,
        logs,
        alarms,
        tierIndex,
        avgSolveTime,
        successRate,
        streak,
        aiReadiness,
        aiRecommendation,
        habitBreakdown: aiReadiness?.habitScoreBreakdown
      });
      setDone(true);
      setTimeout(() => setDone(false), 4000);
    } catch (err) {
      console.error('PDF error', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div style={{ position: 'relative', width: 44, height: 44 }}>
        <div style={{ position: 'absolute', inset: 0, border: '2px solid var(--border)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', inset: 0, border: '2px solid transparent', borderTopColor: 'var(--accent-mid)', borderRadius: '50%', animation: 'rSpin 0.8s linear infinite' }} />
      </div>
      <style>{`@keyframes rSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '28px 24px' }} className="r-fade">

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: 26, fontWeight: 800, color: 'var(--text)', marginBottom: 6 }}>
            📄 Performance Report
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Your full cognitive wake report — download as a professional PDF to track, share or review your progress.
          </p>
        </div>

        <button
          onClick={handleDownload}
          disabled={generating}
          className="btn-primary"
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '14px 28px',
            background: done ? '#2c5e3b' : '#432f2e',
            color: done ? '#ffffff' : '#feefb8',
            border: '1px solid rgba(67, 47, 46, 0.3)',
            borderRadius: 14,
            fontSize: 14, fontWeight: 700,
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            cursor: generating ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 16px rgba(67, 47, 46, 0.2)',
            transition: 'all 0.2s ease',
            opacity: generating ? 0.8 : 1,
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => { if (!generating) { e.currentTarget.style.transform = 'translateY(-2px)'; } }}
          onMouseLeave={e => { if (!generating) { e.currentTarget.style.transform = 'none'; } }}
        >
          {generating ? (
            <><RefreshCw size={17} style={{ animation: 'rSpin 0.8s linear infinite' }} /> Generating PDF…</>
          ) : done ? (
            <><CheckCircle2 size={17} /> Downloaded! ✓</>
          ) : (
            <><FileDown size={17} /> Download PDF Report</>
          )}
        </button>
      </div>

      {/* User banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(67, 47, 46, 0.06), rgba(67, 47, 46, 0.04))',
        border: '1px solid rgba(67, 47, 46, 0.06)', borderRadius: 18,
        padding: '18px 22px', marginBottom: 28,
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: 'rgba(67, 47, 46, 0.06)', border: '1px solid rgba(67, 47, 46, 0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          boxShadow: '0 0 20px rgba(67, 47, 46, 0.06)',
        }}>
          <Shield size={22} color="#a78bfa" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontWeight: 700, fontSize: 14, color: 'var(--text)', marginBottom: 3 }}>
            {user?.displayName || user?.name || user?.email?.split('@')[0] || 'User'} — CognAlarm Performance Report
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Includes: streak stats, success rate, avg solve time, difficulty tier, puzzle history &amp; AI recommendations
          </div>
        </div>
        <div style={{
          padding: '6px 14px', borderRadius: 20,
          background: tier.color + '18', border: '1px solid ' + tier.color + '35',
          color: tier.color, fontWeight: 700, fontSize: 12, flexShrink: 0,
        }}>
          {tier.title}
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
          Report Preview — Key Metrics
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {STATS.map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 14, padding: '16px 18px',
              display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = color + '50'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}
            >
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: bg, border: '1px solid ' + color + '25',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Icon size={17} color={color} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>{value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Difficulty progression */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 16, padding: '20px 22px', marginTop: 20, marginBottom: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <span style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>
            Adaptive Difficulty Progression
          </span>
          <span style={{ fontSize: 12, fontWeight: 700, color: tier.color }}>Current: {tier.title}</span>
        </div>
        <div style={{ position: 'relative', height: 8, background: 'var(--bg-surface)', borderRadius: 4, overflow: 'hidden', marginBottom: 12 }}>
          <div style={{
            position: 'absolute', left: 0, top: 0, height: '100%',
            width: tierIndex === 0 ? '33%' : tierIndex === 1 ? '66%' : '100%',
            background: 'linear-gradient(90deg, #432f2e, ' + tier.color + ')',
            borderRadius: 4, transition: 'width 1s ease',
            boxShadow: '0 0 10px ' + tier.color + '60',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {TIERS.map((t, i) => (
            <div key={t.id} style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: i <= tierIndex ? 700 : 500, color: i <= tierIndex ? t.color : 'var(--text-muted)' }}>
                {i === 0 ? '🟢' : i === 1 ? '🟡' : '🔴'} {t.title}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{t.streakReq}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent history preview */}
      {logs.length > 0 && (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 16, padding: '20px 22px', marginBottom: 20,
        }}>
          <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontWeight: 700, fontSize: 14, color: 'var(--text)', marginBottom: 14 }}>
            Recent Wake History (last 5 entries)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {logs.slice(0, 5).map((l, i) => {
              const ok = l.status === 'Success';
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '8px 12px', borderRadius: 10,
                  background: ok ? 'rgba(67, 47, 46, 0.06)' : 'rgba(67, 47, 46, 0.06)',
                  border: '1px solid ' + (ok ? 'rgba(67, 47, 46, 0.06)' : 'rgba(67, 47, 46, 0.06)'),
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: ok ? '#432f2e' : '#5c3e38', flexShrink: 0 }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', flex: 1 }}>{l.alarmLabel || 'Alarm'}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{l.datetime}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{l.solveTime || '-'}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: ok ? '#432f2e' : '#5c3e38' }}>{l.status}</span>
                </div>
              );
            })}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10, textAlign: 'center' }}>
            <Sparkles size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            Full history ({logs.length} records) is included in the PDF report
          </div>
        </div>
      )}

      {/* What's in the PDF */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '20px 22px' }}>
        <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontWeight: 700, fontSize: 14, color: 'var(--text)', marginBottom: 14 }}>
          📋 What's Included in the PDF
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {[
            { e: '👤', t: 'User Profile',       d: 'Name, email & current difficulty tier' },
            { e: '📊', t: 'Performance Stats',  d: 'Streak, success rate, solve time, alarms' },
            { e: '📈', t: 'Difficulty Progress', d: 'Visual bar: Beginner → Easy → Medium → Hard → Expert' },
            { e: '🤖', t: 'AI Recommendation',  d: 'Personalised cognitive wake insights' },
            { e: '📜', t: 'Full Wake History',  d: 'Every alarm with status & puzzle solve time' },
            { e: '🧩', t: 'Puzzle Breakdown',   d: 'Which puzzle types you completed most' },
          ].map(item => (
            <div key={item.t} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{item.e}</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{item.t}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>{item.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes rSpin { to { transform: rotate(360deg); } }
        .r-fade { animation: rFadeIn 0.35s ease both; }
        @keyframes rFadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
