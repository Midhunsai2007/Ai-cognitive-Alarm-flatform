import React, { useEffect, useState } from 'react';
import { historyAPI } from '../services/api';
import { History, Trash2, CheckCircle2, XCircle, Clock } from 'lucide-react';

const FILTERS = ['All', 'Success', 'Snoozed'];
const PUZZLE_LABELS = { math: 'Math', pattern: 'Pattern', memory: 'Memory flip', stroop: 'Stroop', word: 'Word scramble' };
const PUZZLE_EMOJI  = { math: '🧮', pattern: '🔢', memory: '🃏', stroop: '🎨', word: '📝' };

function HistoryCard({ log }) {
  const success = log.status === 'Success';
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: `1px solid ${success ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.12)'}`,
      borderRadius: 14,
      padding: '16px 18px',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      transition: 'all 0.15s',
      animation: 'slideUp 0.25s ease both',
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.borderColor = success ? 'rgba(16,185,129,0.3)' : 'rgba(244,63,94,0.25)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = success ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.12)'; }}
    >
      {/* Status indicator */}
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: success ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.08)',
        border: `1px solid ${success ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.15)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {success
          ? <CheckCircle2 size={18} color="#10b981" />
          : <XCircle size={18} color="#f43f5e" />
        }
      </div>

      {/* Main info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <span style={{
            fontSize: 13, fontWeight: 700, color: 'var(--text)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {log.alarmLabel}
          </span>
          <span style={{
            fontSize: 10, fontWeight: 700,
            padding: '1px 8px', borderRadius: 20,
            background: success ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.08)',
            color: success ? '#10b981' : '#f43f5e',
            border: `1px solid ${success ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.15)'}`,
            flexShrink: 0,
          }}>
            {log.status}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
            <Clock size={10} /> {log.datetime}
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {PUZZLE_EMOJI[log.puzzleType]} {PUZZLE_LABELS[log.puzzleType] || log.puzzleType}
          </span>
          {log.solveTime && (
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
              ⏱ {log.solveTime}
            </span>
          )}
        </div>
      </div>

      {/* Streak impact */}
      <div style={{
        fontSize: 12, fontWeight: 700,
        color: success ? '#10b981' : '#f43f5e',
        flexShrink: 0,
        textAlign: 'right',
      }}>
        {log.streakImpact}
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const [logs, setLogs]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('All');

  useEffect(() => {
    historyAPI.getHistory()
      .then(d => setLogs(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'All' ? logs : logs.filter(l => l.status === filter);

  const handleClear = async () => {
    if (!confirm('Clear all history? This cannot be undone.')) return;
    await historyAPI.clearHistory();
    setLogs([]);
  };

  const successCount  = logs.filter(l => l.status === 'Success').length;
  const snoozedCount  = logs.filter(l => l.status !== 'Success').length;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 24px' }} className="fade-in">

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 24, fontWeight: 800,
            color: 'var(--text)', marginBottom: 5,
          }}>History</h1>
          <div style={{ display: 'flex', gap: 10 }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{logs.length} events</span>
            {logs.length > 0 && (
              <>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>
                  ✓ {successCount}
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: 'rgba(244,63,94,0.08)', color: '#f43f5e', border: '1px solid rgba(244,63,94,0.15)' }}>
                  💤 {snoozedCount}
                </span>
              </>
            )}
          </div>
        </div>
        {logs.length > 0 && (
          <button className="btn-danger" onClick={handleClear} style={{ fontSize: 12 }}>
            <Trash2 size={13} /> Clear all
          </button>
        )}
      </div>

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: 7, marginBottom: 24 }}>
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '6px 16px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s',
              background: filter === f
                ? 'linear-gradient(135deg, rgba(124,58,237,0.35), rgba(79,70,229,0.25))'
                : 'rgba(139,92,246,0.05)',
              color: filter === f ? 'var(--accent-light)' : 'var(--text-muted)',
              boxShadow: filter === f ? '0 2px 12px rgba(124,58,237,0.2)' : 'none',
              outline: filter === f ? '1px solid rgba(139,92,246,0.3)' : '1px solid rgba(139,92,246,0.1)',
            }}
          >
            {f === 'All' ? '🔀 All' : f === 'Success' ? '✅ Success' : '💤 Snoozed'}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <div style={{ position: 'relative', width: 40, height: 40 }}>
            <div style={{ position: 'absolute', inset: 0, border: '2px solid rgba(139,92,246,0.1)', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', inset: 0, border: '2px solid transparent', borderTopColor: 'var(--accent-mid)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 18,
          padding: '60px 24px',
          textAlign: 'center',
        }}>
          <div style={{
            width: 56, height: 56,
            background: 'rgba(139,92,246,0.07)',
            border: '1px solid rgba(139,92,246,0.14)',
            borderRadius: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px',
          }}>
            <History size={24} color="var(--accent-light)" />
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            {filter === 'All' ? 'No history yet — complete your first alarm!' : `No ${filter.toLowerCase()} events found.`}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map((log, i) => (
            <div key={log.id} style={{ animationDelay: `${i * 0.04}s` }}>
              <HistoryCard log={log} />
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
