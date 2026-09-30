import React, { useEffect, useState } from 'react';
import { alarmAPI } from '../services/api';
import { AlarmModal } from '../components/AlarmModal';
import { formatTime12h } from '../utils/timeUtils';
import { PuzzleModal } from '../components/CognitivePuzzles/PuzzleModal';
import { Bell, Plus, Trash2, Play, AlertTriangle, X } from 'lucide-react';

const PUZZLE_LABELS = { math: 'Math', pattern: 'Pattern', memory: 'Memory flip', stroop: 'Stroop', word: 'Word scramble' };
const PUZZLE_EMOJI  = { math: '🧮', pattern: '🔢', memory: '🃏', stroop: '🎨', word: '📝' };
const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const DIFF_CONFIG = {
  easy:   { color: '#5c4342', bg: 'rgba(67, 47, 46, 0.06)', border: 'rgba(67, 47, 46, 0.16)' },
  medium: { color: '#432f2e', bg: 'rgba(67, 47, 46, 0.1)',  border: 'rgba(67, 47, 46, 0.22)' },
  hard:   { color: '#271c1b', bg: 'rgba(67, 47, 46, 0.15)', border: 'rgba(67, 47, 46, 0.3)'  },
};

function AlarmCard({ alarm, onToggle, onDeleteClick, onTest }) {
  const dc = DIFF_CONFIG[alarm.difficulty] || DIFF_CONFIG.medium;
  const active = alarm.active;
  const displayTime = formatTime12h(alarm.time);

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: `1px solid ${active ? 'var(--border-strong)' : 'var(--border)'}`,
      borderRadius: 18,
      padding: '22px',
      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      position: 'relative',
      overflow: 'hidden',
      animation: 'slideUp 0.3s ease both',
      boxShadow: '0 2px 10px rgba(67, 47, 46, 0.04)',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.borderColor = 'var(--border-strong)';
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 8px 24px rgba(67, 47, 46, 0.08)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.borderColor = active ? 'var(--border-strong)' : 'var(--border)';
      e.currentTarget.style.transform = 'none';
      e.currentTarget.style.boxShadow = '0 2px 10px rgba(67, 47, 46, 0.04)';
    }}
    >
      {/* Top accent line when active */}
      {active && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: 3,
          background: '#432f2e',
        }} />
      )}

      {/* Top row: 12-Hour Time + toggle */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <div style={{
            fontSize: 34,
            fontWeight: 700,
            fontFamily: "'Lora', Georgia, 'Times New Roman', serif",
            fontVariantNumeric: 'tabular-nums',
            color: active ? 'var(--text)' : 'var(--text-muted)',
            lineHeight: 1,
            letterSpacing: '-0.02em',
            transition: 'color 0.2s',
          }}>
            {displayTime}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6, fontWeight: 600 }}>
            {PUZZLE_EMOJI[alarm.cognitiveType]} {alarm.label}
          </div>
        </div>

        <label className="toggle" style={{ marginTop: 4 }} title={active ? "Alarm is active (click to turn off)" : "Alarm is inactive (click to turn on)"}>
          <input
            type="checkbox"
            checked={alarm.active}
            onChange={() => onToggle(alarm.id)}
            aria-label={active ? "Disable alarm" : "Enable alarm"}
          />
          <span className="toggle-slider" />
        </label>
      </div>

      {/* Days row */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {ALL_DAYS.map(d => {
          const on = alarm.days?.includes(d);
          return (
            <span key={d} style={{
              fontSize: 11,
              fontWeight: 800,
              width: 30, height: 30,
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: on ? '#feefb8' : 'var(--bg-hover)',
              color: on ? '#432f2e' : 'var(--text-muted)',
              border: `1px solid ${on ? 'rgba(67, 47, 46, 0.18)' : 'var(--border)'}`,
              transition: 'all 0.15s',
            }}>
              {d.charAt(0)}
            </span>
          );
        })}
      </div>

      {/* Badges + Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span style={{
            fontSize: 11, fontWeight: 700,
            padding: '4px 9px', borderRadius: 6,
            background: dc.bg, color: dc.color,
            border: `1px solid ${dc.border}`,
            textTransform: 'capitalize',
          }}>
            {alarm.difficulty}
          </span>
          <span className="badge badge-blue" style={{ textTransform: 'capitalize' }}>
            {PUZZLE_LABELS[alarm.cognitiveType] || alarm.cognitiveType}
          </span>
          <span style={{
            fontSize: 11, fontWeight: 700,
            padding: '4px 9px', borderRadius: 6,
            background: 'var(--bg-hover)', color: 'var(--text-secondary)',
            border: '1px solid var(--border)',
            display: 'inline-flex', alignItems: 'center', gap: 3,
          }} title={`Snooze duration: ${alarm.snoozeTime || 5} minutes`}>
            💤 {alarm.snoozeTime || 5}m
          </span>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => onTest(alarm)}
            title="Test alarm & solve challenge"
            style={{
              padding: '7px 13px',
              background: '#feefb8',
              border: '1px solid rgba(67, 47, 46, 0.15)',
              borderRadius: 8, fontSize: 11, fontWeight: 800,
              color: '#432f2e', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 5,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#432f2e'; e.currentTarget.style.color = '#feefb8'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#feefb8'; e.currentTarget.style.color = '#432f2e'; }}
          >
            <Play size={11} /> Test
          </button>
          <button
            onClick={() => onDeleteClick(alarm)}
            title="Delete alarm"
            style={{
              padding: '7px 10px',
              background: 'rgba(179, 57, 57, 0.08)',
              border: '1px solid rgba(179, 57, 57, 0.2)',
              borderRadius: 8,
              color: 'var(--danger)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 4,
              fontSize: 11, fontWeight: 700,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(179, 57, 57, 0.08)'; e.currentTarget.style.color = 'var(--danger)'; }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AlarmsPage() {
  const [alarms, setAlarms]               = useState([]);
  const [modalOpen, setModalOpen]         = useState(false);
  const [testAlarm, setTestAlarm]         = useState(null);
  const [puzzleOpen, setPuzzleOpen]       = useState(false);
  const [alarmToDelete, setAlarmToDelete] = useState(null);
  const [initialAlarmForModal, setInitialAlarmForModal] = useState(null);
  const [loading, setLoading]             = useState(true);

  const fetchAlarms = async () => {
    try {
      const data = await alarmAPI.getAlarms().catch(() => []);
      setAlarms(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load alarms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAlarms(); }, []);

  const handleCreate = async (fd) => {
    try {
      const c = await alarmAPI.createAlarm(fd);
      setAlarms(p => [c, ...p]);
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggle = async (id) => {
    try {
      const res = await alarmAPI.toggleAlarm(id);
      setAlarms(p => p.map(a => String(a.id) === String(id) ? { ...a, active: res.active } : a));
    } catch (e) {
      console.error(e);
    }
  };

  const confirmDelete = async () => {
    if (!alarmToDelete) return;
    const targetId = alarmToDelete.id;
    // Optimistic UI update immediately
    setAlarms(p => p.filter(a => String(a.id) !== String(targetId)));
    setAlarmToDelete(null);

    try {
      await alarmAPI.deleteAlarm(targetId);
    } catch (e) {
      console.error('Delete alarm error:', e);
    }
  };

  const handleTest = (alarm) => {
    setTestAlarm(alarm);
    setPuzzleOpen(true);
  };

  const activeCount = alarms.filter(a => a.active).length;

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '28px 24px' }} className="fade-in">

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 style={{
            fontFamily: "'Lora', Georgia, 'Times New Roman', serif",
            fontSize: 28, fontWeight: 700,
            color: 'var(--text)', marginBottom: 6,
            letterSpacing: '-0.01em',
          }}>
            Alarm Schedule
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>
              {alarms.length} configured
            </span>
            {activeCount > 0 && (
              <span className="badge badge-butter">
                {activeCount} active
              </span>
            )}
          </div>
        </div>
        <button
          className="btn-primary"
          style={{ fontSize: 13 }}
          onClick={() => { setInitialAlarmForModal(null); setModalOpen(true); }}
        >
          <Plus size={15} /> New alarm
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
          <div style={{ position: 'relative', width: 44, height: 44 }}>
            <div style={{ position: 'absolute', inset: 0, border: '2px solid var(--border)', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', inset: 0, border: '2px solid transparent', borderTopColor: 'var(--accent-mid)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        </div>
      ) : alarms.length === 0 ? (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 20,
          padding: '60px 24px',
          textAlign: 'center',
          maxWidth: 440,
          margin: '40px auto',
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'var(--accent-bg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <Bell size={28} color="var(--accent-mid)" />
          </div>
          <h3 style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontWeight: 700, fontSize: 17, color: 'var(--text)', marginBottom: 8 }}>
            No alarms yet
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 22 }}>
            Create your first cognitive alarm with a 12-hour AM/PM wake schedule.
          </p>
          <button className="btn-primary" style={{ fontSize: 13 }} onClick={() => setModalOpen(true)}>
            <Plus size={14} /> Create alarm
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16,
        }}>
          {alarms.map((alarm, i) => (
            <div key={alarm.id} style={{ animationDelay: `${i * 0.06}s` }}>
              <AlarmCard
                alarm={alarm}
                onToggle={handleToggle}
                onDeleteClick={(a) => setAlarmToDelete(a)}
                onTest={handleTest}
              />
            </div>
          ))}
        </div>
      )}

      <AlarmModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setInitialAlarmForModal(null); }}
        onSave={handleCreate}
        initialAlarm={initialAlarmForModal}
      />
      <PuzzleModal alarm={testAlarm} isOpen={puzzleOpen} onClose={() => { setPuzzleOpen(false); setTestAlarm(null); }} onSolveComplete={() => {}} />

      {/* Modern In-App Delete Confirmation Modal */}
      {alarmToDelete && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          padding: 20,
          animation: 'fadeIn 0.15s ease',
        }}>
          <div style={{
            width: '100%', maxWidth: 420,
            background: 'var(--bg-card)',
            border: '1px solid var(--border-strong)',
            borderRadius: 18,
            boxShadow: '0 24px 70px rgba(0,0,0,0.5)',
            overflow: 'hidden',
            animation: 'slideUp 0.2s ease',
          }}>
            <div style={{
              padding: '22px 24px 16px',
              display: 'flex', alignItems: 'flex-start', gap: 14,
            }}>
              <div style={{
                width: 42, height: 42, borderRadius: 12,
                background: 'rgba(244,63,94,0.12)',
                border: '1px solid rgba(244,63,94,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <AlertTriangle size={20} color="var(--danger)" />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  fontSize: 17, fontWeight: 800,
                  color: 'var(--text)', marginBottom: 6,
                }}>
                  Delete Alarm?
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Are you sure you want to delete <strong style={{ color: 'var(--text)' }}>{formatTime12h(alarmToDelete.time)} — {alarmToDelete.label}</strong>? This action cannot be undone.
                </p>
              </div>
            </div>

            <div style={{
              display: 'flex', gap: 10,
              padding: '16px 24px',
              background: 'var(--bg-surface)',
              borderTop: '1px solid var(--border)',
            }}>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setAlarmToDelete(null)}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  border: 'none',
                  background: 'var(--danger)',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  boxShadow: '0 4px 16px rgba(244,63,94,0.3)',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'none'; }}
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
