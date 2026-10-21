import React, { useEffect, useState } from 'react';
import { historyAPI } from '../services/api';
import { History, Trash2, CheckCircle2, Clock } from 'lucide-react';

const FILTERS = ['All', 'Success', 'Snoozed'];
const PUZZLE_LABELS = { math: 'Math', pattern: 'Pattern', memory: 'Memory flip', stroop: 'Stroop', word: 'Word scramble' };
const PUZZLE_EMOJI  = { math: '🧮', pattern: '🔢', memory: '🃏', stroop: '🎨', word: '📝' };

function HistoryCard({ log }) {
  const success = log.status === 'Success';
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 14,
      padding: '16px 18px',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      transition: 'all 0.15s ease',
      animation: 'slideUp 0.25s ease both',
      boxShadow: '0 2px 8px rgba(67, 47, 46, 0.03)',
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'var(--border)'; }}
    >
      {/* Status indicator - strictly brown and light colors */}
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: success ? 'rgba(67, 47, 46, 0.06)' : 'rgba(67, 47, 46, 0.04)',
        border: `1px solid ${success ? 'rgba(67, 47, 46, 0.16)' : 'rgba(67, 47, 46, 0.12)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {success
          ? <CheckCircle2 size={18} color="#432f2e" />
          : <Clock size={18} color="#68504f" />
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
            padding: '2px 9px', borderRadius: 20,
            background: success ? 'rgba(67, 47, 46, 0.08)' : 'rgba(67, 47, 46, 0.04)',
            color: success ? '#432f2e' : '#68504f',
            border: `1px solid ${success ? 'rgba(67, 47, 46, 0.18)' : 'rgba(67, 47, 46, 0.12)'}`,
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
        fontSize: 12, fontWeight: 800,
        color: success ? '#432f2e' : '#68504f',
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
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            fontSize: 24, fontWeight: 800,
            color: 'var(--text)', marginBottom: 5,
          }}>History</h1>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{logs.length} events</span>
            {logs.length > 0 && (
              <>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 20,
                  background: 'rgba(67, 47, 46, 0.06)', color: 'var(--text)',
                  border: '1px solid var(--border)'
                }}>
                  ✓ {successCount}
                </span>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 20,
                  background: 'rgba(67, 47, 46, 0.04)', color: 'var(--text-secondary)',
                  border: '1px solid var(--border)'
                }}>
                  💤 {snoozedCount}
                </span>
              </>
            )}
          </div>
        </div>
        {logs.length > 0 && (
          <button
            onClick={handleClear}
            style={{
              fontSize: 12, fontWeight: 700,
              padding: '7px 14px', borderRadius: 8,
              background: 'var(--bg-card)', color: 'var(--text)',
              border: '1px solid var(--border-strong)',
              display: 'flex', alignItems: 'center', gap: 6,
              cursor: 'pointer', transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-card)'; }}
          >
            <Trash2 size={13} color="var(--accent-mid)" /> Clear all
          </button>
        )}
      </div>

      {/* Filter pills - Strictly Brown & Light Colors */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {FILTERS.map(f => {
          const active = filter === f;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '7px 18px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
                border: active ? '1px solid #432f2e' : '1px solid var(--border)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                background: active ? '#432f2e' : 'var(--bg-hover)',
                color: active ? '#ffffff' : 'var(--text-secondary)',
                boxShadow: active ? '0 2px 8px rgba(67, 47, 46, 0.15)' : 'none',
              }}
              onMouseEnter={e => {
                if (!active) {
                  e.currentTarget.style.borderColor = 'var(--border-strong)';
                  e.currentTarget.style.color = 'var(--text)';
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              {f}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <div style={{ position: 'relative', width: 40, height: 40 }}>
            <div style={{ position: 'absolute', inset: 0, border: '2px solid var(--border)', borderRadius: '50%' }} />
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
            width: 54, height: 54,
            background: 'var(--accent-bg)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px',
          }}>
            <History size={24} color="var(--accent-mid)" />
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
