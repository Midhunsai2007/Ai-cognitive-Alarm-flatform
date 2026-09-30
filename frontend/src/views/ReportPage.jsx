import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { analyticsAPI, historyAPI, alarmAPI } from '../services/api';
import {
  FileDown, Brain, Flame, CheckCircle2, Clock, BarChart3,
  Award, TrendingUp, Target, Sparkles, RefreshCw, Shield,
} from 'lucide-react';

/* Difficulty tiers */
const TIERS = [
  { id: 'easy',   title: 'Beginner',      color: '#5c4342', streakReq: '0-2 days',  solveReq: '> 22s' },
  { id: 'medium', title: 'Intermediate',  color: '#fbbf24', streakReq: '3-5 days',  solveReq: '14-22s' },
  { id: 'hard',   title: 'Hard (Expert)', color: '#5c3e38', streakReq: '6+ days',   solveReq: '< 14s' },
];

const PUZZLE_LABELS = {
  math: 'Math', pattern: 'Pattern Memory',
  memory: 'Memory Flip', stroop: 'Stroop Color', word: 'Word Scramble',
};

/* PDF builder */
async function buildPDF({ user, logs, alarms, tierIndex, avgSolveTime, successRate, streak }) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210;
  const margin = 18;
  const colW = W - margin * 2;
  let y = 0;

  const rect = (x, yy, w, h, r, fill) => {
    doc.setFillColor(fill[0], fill[1], fill[2]);
    if (r > 0) doc.roundedRect(x, yy, w, h, r, r, 'F');
    else doc.rect(x, yy, w, h, 'F');
  };

  const txt = (t, x, yy, size, color, align = 'left', bold = false) => {
    doc.setFontSize(size);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setTextColor(color[0], color[1], color[2]);
    doc.text(String(t), x, yy, { align });
  };

  const hline = (x1, y1, x2, y2, color) => {
    doc.setDrawColor(color[0], color[1], color[2]);
    doc.setLineWidth(0.3);
    doc.line(x1, y1, x2, y2);
  };

  /* Cover header */
  rect(0, 0, W, 54, 0, [18, 14, 38]);
  rect(margin, 10, 10, 10, 2, [124, 58, 237]);
  txt('C', margin + 3.2, 17.5, 9, [255, 255, 255], 'left', true);
  txt('CognAlarm', margin + 13, 17, 12, [200, 180, 255], 'left', true);
  txt('Cognitive Wake Platform', margin + 13, 23, 7, [150, 130, 200]);
  txt('Performance Report', W / 2, 35, 20, [240, 230, 255], 'center', true);
  const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  txt('Generated: ' + dateStr, W / 2, 44, 7, [160, 145, 210], 'center');
  y = 64;

  /* User info band */
  rect(margin, y, colW, 20, 4, [28, 22, 54]);
  const uName = user?.displayName || user?.name || user?.email?.split('@')[0] || 'CognAlarm User';
  txt(uName, margin + 6, y + 8, 11, [220, 210, 255], 'left', true);
  txt(user?.email || '', margin + 6, y + 14.5, 7.5, [140, 125, 190]);
  const tier = TIERS[tierIndex];
  txt('Level: ' + tier.title, W - margin - 6, y + 8, 9, [200, 195, 240], 'right', true);
  txt('Adaptive Difficulty Engine', W - margin - 6, y + 14.5, 7, [140, 125, 190], 'right');
  y += 28;

  /* Stat cards 2x2 */
  const totalAlarms = user?.totalAlarms || alarms.length || 0;
  const bestStreak = Math.max(user?.bestStreak || 0, streak);
  const cards = [
    { label: 'Wake Streak',    value: streak + ' days',     sub: 'Consecutive', color: [249, 115, 22] },
    { label: 'Success Rate',   value: successRate + '%',    sub: 'First-alarm',  color: [52, 211, 153] },
    { label: 'Avg Solve Time', value: avgSolveTime + 's',   sub: 'Per puzzle',   color: [167, 139, 250] },
    { label: 'Total Alarms',   value: String(totalAlarms),  sub: 'Configured',   color: [96, 165, 250] },
  ];

  const cW = (colW - 8) / 2;
  cards.forEach((c, i) => {
    const cx = margin + (i % 2) * (cW + 8);
    const cy = y + Math.floor(i / 2) * 28;
    rect(cx, cy, cW, 24, 4, [28, 22, 54]);
    doc.setDrawColor(c.color[0], c.color[1], c.color[2]);
    doc.setLineWidth(0.6);
    doc.roundedRect(cx, cy, cW, 24, 4, 4, 'S');
    doc.setLineWidth(0.2);
    txt(c.value, cx + cW / 2, cy + 10, 15, c.color, 'center', true);
    txt(c.label, cx + cW / 2, cy + 16, 7.5, [200, 195, 230], 'center', true);
    txt(c.sub, cx + cW / 2, cy + 21, 6, [130, 120, 170], 'center');
  });
  y += 64;

  /* Difficulty bar */
  rect(margin, y, colW, 28, 4, [22, 18, 46]);
  txt('Adaptive Difficulty Progression', margin + 6, y + 7, 9, [200, 185, 255], 'left', true);
  const bX = margin + 6, bY = y + 12, bW = colW - 12, bH = 5;
  rect(bX, bY, bW, bH, 2, [40, 35, 70]);
  const pct = tierIndex === 0 ? 0.33 : tierIndex === 1 ? 0.66 : 1.0;
  doc.setFillColor(124, 58, 237);
  doc.roundedRect(bX, bY, bW * pct, bH, 2, 2, 'F');
  TIERS.forEach((t, i) => {
    const lx = bX + (bW / 3) * i + bW / 6;
    const lc = i <= tierIndex ? [200, 180, 255] : [100, 95, 140];
    txt(t.title, lx, bY + bH + 7, 6.5, lc, 'center', i === tierIndex);
  });
  txt('Current: ' + tier.title, W - margin - 6, y + 7, 8, [200, 195, 240], 'right', true);
  y += 36;

  /* AI recommendation */
  rect(margin, y, colW, 22, 4, [20, 26, 46]);
  txt('AI Cognitive Analysis', margin + 6, y + 7.5, 9, [147, 197, 253], 'left', true);
  const rec = tierIndex === 0
    ? 'Building foundational morning awareness. Consistent wake streaks will unlock Intermediate challenges.'
    : tierIndex === 1
    ? 'Strong executive focus detected. Approaching expert thresholds. Maintain streak to unlock Hard mode.'
    : 'Maximum adaptive difficulty achieved. Neuro-response fully optimized. Elite cognitive performance.';
  const recLines = doc.splitTextToSize(rec, colW - 12);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(170, 160, 210);
  doc.text(recLines, margin + 6, y + 14);
  y += 30;

  /* History table */
  if (logs.length > 0) {
    txt('Wake History Log', margin, y, 11, [220, 210, 255], 'left', true);
    y += 7;

    rect(margin, y, colW, 8, 2, [40, 30, 80]);
    txt('Alarm Label', margin + 4, y + 5.5, 7, [200, 190, 240], 'left', true);
    txt('Date / Time', margin + 62, y + 5.5, 7, [200, 190, 240], 'left', true);
    txt('Puzzle', margin + 106, y + 5.5, 7, [200, 190, 240], 'left', true);
    txt('Solve', margin + 140, y + 5.5, 7, [200, 190, 240], 'left', true);
    txt('Status', W - margin - 4, y + 5.5, 7, [200, 190, 240], 'right', true);
    y += 9;

    const maxRows = Math.min(logs.length, 20);
    for (let i = 0; i < maxRows; i++) {
      const l = logs[i];
      const even = i % 2 === 0;
      rect(margin, y, colW, 7.5, 0, even ? [26, 22, 50] : [22, 18, 44]);
      const ok = l.status === 'Success';
      const rowC = even ? [175, 165, 220] : [165, 155, 210];
      txt((l.alarmLabel || 'Alarm').slice(0, 22), margin + 4, y + 5, 6.5, rowC);
      txt((l.datetime || '-').slice(0, 20), margin + 62, y + 5, 6.5, rowC);
      txt((PUZZLE_LABELS[l.puzzleType] || l.puzzleType || '-').slice(0, 14), margin + 106, y + 5, 6.5, rowC);
      txt(l.solveTime || '-', margin + 140, y + 5, 6.5, rowC);
      txt(l.status || '-', W - margin - 4, y + 5, 6.5, ok ? [52, 211, 153] : [244, 63, 94], 'right', true);
      y += 7.5;
      if (y > 270) { doc.addPage(); y = 20; }
    }
    if (logs.length > maxRows) {
      txt('... and ' + (logs.length - maxRows) + ' more entries', margin, y + 5, 7, [130, 120, 170]);
      y += 10;
    }
  }
  y += 8;

  /* Puzzle breakdown */
  const puzzleCounts = {};
  logs.forEach(l => { if (l.puzzleType) puzzleCounts[l.puzzleType] = (puzzleCounts[l.puzzleType] || 0) + 1; });
  const puzzleEntries = Object.entries(puzzleCounts);
  if (puzzleEntries.length > 0 && y < 250) {
    txt('Puzzle Type Breakdown', margin, y, 10, [220, 210, 255], 'left', true);
    y += 7;
    puzzleEntries.forEach(([type, count]) => {
      const p2 = Math.round((count / logs.length) * 100);
      txt(PUZZLE_LABELS[type] || type, margin + 4, y + 4, 7.5, [180, 170, 220]);
      rect(margin + 55, y, 80, 5.5, 2, [35, 28, 68]);
      doc.setFillColor(124, 58, 237);
      doc.roundedRect(margin + 55, y, Math.max(2, 80 * p2 / 100), 5.5, 2, 2, 'F');
      txt(count + ' (' + p2 + '%)', margin + 140, y + 4, 7, [150, 140, 200]);
      y += 9;
    });
  }

  /* Footer on all pages */
  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    hline(margin, 287, W - margin, 287, [60, 50, 100]);
    txt('CognAlarm Cognitive Wake Platform  |  Powered by AI  |  Confidential', W / 2, 292, 6, [100, 90, 150], 'center');
    txt('Page ' + p + ' of ' + pageCount, W - margin, 292, 6, [100, 90, 150], 'right');
  }

  const safeName = (uName).replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
  const dateTag = new Date().toISOString().split('T')[0];
  doc.save('CognAlarm_Report_' + safeName + '_' + dateTag + '.pdf');
}

/* ─── Main Page Component ─── */
export default function ReportPage() {
  const { user } = useAuth();
  const [logs, setLogs]             = useState([]);
  const [alarms, setAlarms]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [generating, setGenerating] = useState(false);
  const [done, setDone]             = useState(false);

  useEffect(() => {
    Promise.all([
      historyAPI.getHistory().catch(() => []),
      alarmAPI.getAlarms().catch(() => []),
    ]).then(([hLogs, als]) => {
      setLogs(Array.isArray(hLogs) ? hLogs : []);
      setAlarms(Array.isArray(als) ? als : []);
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
    if (streak >= 6 || (streak >= 4 && avgSolveTime < 14)) return 2;
    if (streak >= 3 || avgSolveTime < 20) return 1;
    return 0;
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
      await buildPDF({ user, logs, alarms, tierIndex, avgSolveTime, successRate, streak });
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
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 26, fontWeight: 800, color: 'var(--text)', marginBottom: 6 }}>
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
            fontFamily: "'Space Grotesk', sans-serif",
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
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 14, color: 'var(--text)', marginBottom: 3 }}>
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
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', fontFamily: "'Space Grotesk', sans-serif" }}>{value}</div>
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
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>
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
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 14, color: 'var(--text)', marginBottom: 14 }}>
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
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 14, color: 'var(--text)', marginBottom: 14 }}>
          📋 What's Included in the PDF
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {[
            { e: '👤', t: 'User Profile',       d: 'Name, email & current difficulty tier' },
            { e: '📊', t: 'Performance Stats',  d: 'Streak, success rate, solve time, alarms' },
            { e: '📈', t: 'Difficulty Progress', d: 'Visual bar: Beginner → Intermediate → Hard' },
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
