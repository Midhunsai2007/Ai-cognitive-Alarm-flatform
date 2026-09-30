import React, { useState, useEffect } from 'react';
import { X, Clock, Volume2, Brain, Tag, Calendar, Repeat } from 'lucide-react';
import { previewSound } from '../services/audio';
import { parse12h, formatTime12h } from '../utils/timeUtils';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const FREQUENCIES = [
  { id: 'once',   label: 'Once',   desc: 'Ring once' },
  { id: 'daily',  label: 'Daily',  desc: 'Every day' },
  { id: 'weekly', label: 'Weekly', desc: 'Custom days' },
];

const COGNITIVE_TYPES = [
  { value: 'math',    label: 'Math',         desc: 'Solve equations',         icon: '🧮', color: '#60a5fa' },
  { value: 'pattern', label: 'Pattern',      desc: 'Repeat grid sequence',    icon: '🔢', color: '#a78bfa' },
  { value: 'memory',  label: 'Memory Flip',  desc: 'Match card pairs',        icon: '🃏', color: '#f472b6' },
  { value: 'stroop',  label: 'Stroop Color', desc: 'Color interference test', icon: '🎨', color: '#34d399' },
  { value: 'word',    label: 'Word Scramble',desc: 'Unscramble words',        icon: '📝', color: '#fbbf24' },
];

const SOUNDS = [
  { value: 'energetic', label: 'Energetic', icon: '⚡' },
  { value: 'digital',   label: 'Digital',   icon: '📡' },
  { value: 'gentle',    label: 'Gentle',    icon: '🌊' },
];

const DIFFICULTIES = [
  { value: 'easy',   label: 'Easy',   color: '#34d399', bg: 'rgba(52, 211, 153, 0.12)', border: 'rgba(52, 211, 153, 0.3)' },
  { value: 'medium', label: 'Medium', color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.12)', border: 'rgba(251, 191, 36, 0.3)' },
  { value: 'hard',   label: 'Hard',   color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.12)',  border: 'rgba(244, 63, 94, 0.3)'  },
];

const SNOOZE_OPTIONS = [
  { value: 1, label: '1 min', badge: 'Quick', desc: '1 min' },
  { value: 2, label: '2 min', badge: 'Brief', desc: '2 min' },
  { value: 5, label: '5 min', badge: 'Standard', desc: '5 min' },
  { value: 10, label: '10 min', badge: 'Relaxed', desc: '10 min' },
  { value: 15, label: '15 min', badge: 'Deep', desc: '15 min' },
];

const labelStyle = {
  display: 'block',
  fontSize: 11,
  fontWeight: 700,
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
  marginBottom: 8,
};

export function AlarmModal({ isOpen, onClose, onSave, initialAlarm }) {
  const [hour12, setHour12] = useState(7);
  const [min12, setMin12]   = useState(0);
  const [ampm, setAmpm]     = useState('AM');
  const [frequency, setFrequency] = useState('daily'); // 'once', 'daily', 'weekly'
  const [snoozeTime, setSnoozeTime] = useState(5);

  const [form, setForm] = useState({
    label: '', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    cognitiveType: 'math', difficulty: 'medium', sound: 'energetic',
    frequency: 'daily',
  });

  useEffect(() => {
    if (initialAlarm) {
      const parsed = parse12h(initialAlarm.time || '07:00');
      setHour12(parsed.hour);
      setMin12(parsed.minute);
      setAmpm(parsed.ampm);

      const days = initialAlarm.days || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      let freq = 'weekly';
      if (days.length === 1 && initialAlarm.frequency === 'once') freq = 'once';
      else if (days.length === 7) freq = 'daily';

      setFrequency(freq);
      setSnoozeTime(initialAlarm.snoozeTime || initialAlarm.snooze_time || 5);
      setForm({
        label: initialAlarm.label || '',
        days,
        cognitiveType: initialAlarm.cognitiveType || 'math',
        difficulty: initialAlarm.difficulty || 'medium',
        sound: initialAlarm.sound || 'energetic',
        frequency: freq,
      });
    } else {
      setHour12(7);
      setMin12(0);
      setAmpm('AM');
      setFrequency('daily');
      setSnoozeTime(5);
      setForm({
        label: '',
        days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        cognitiveType: 'math',
        difficulty: 'medium',
        sound: 'energetic',
        frequency: 'daily',
      });
    }
  }, [initialAlarm, isOpen]);

  if (!isOpen) return null;

  const handleFrequencyChange = (freqId) => {
    setFrequency(freqId);
    const dayIdx = new Date().getDay(); // Sun=0, Mon=1...
    const todayName = DAYS[dayIdx === 0 ? 6 : dayIdx - 1];

    if (freqId === 'once') {
      setForm(p => ({ ...p, days: [todayName], frequency: 'once' }));
    } else if (freqId === 'daily') {
      setForm(p => ({ ...p, days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], frequency: 'daily' }));
    } else if (freqId === 'weekly') {
      setForm(p => ({ ...p, frequency: 'weekly' }));
    }
  };

  const toggleDay = (d) => {
    setFrequency('weekly');
    setForm(p => {
      const nextDays = p.days.includes(d) ? p.days.filter(x => x !== d) : [...p.days, d];
      return { ...p, days: nextDays, frequency: 'weekly' };
    });
  };

  const formatted12hTime = `${String(hour12).padStart(2, '0')}:${String(min12).padStart(2, '0')} ${ampm}`;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.label.trim() || form.days.length === 0) return;
    onSave({
      ...form,
      time: formatted12hTime,
      frequency,
      snoozeTime: Number(snoozeTime) || 5,
    });
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0, 0, 0, 0.72)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      padding: '20px',
      overflowY: 'auto',
    }}>
      <div style={{
        width: '100%', maxWidth: 520,
        maxHeight: '90vh',
        display: 'flex', flexDirection: 'column',
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        border: '1px solid var(--border-strong)',
        borderRadius: 20,
        boxShadow: '0 32px 90px rgba(0,0,0,0.5)',
        overflow: 'hidden',
        margin: 'auto',
        position: 'relative',
        animation: 'modalSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>

        {/* ── Fixed Header ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 24px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-surface)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34,
              background: 'linear-gradient(135deg, var(--accent), var(--indigo))',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 14px var(--accent-glow)',
            }}>
              <Clock size={16} color="#fff" />
            </div>
            <div>
              <h2 style={{
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                fontWeight: 800, fontSize: 16, color: 'var(--text)', lineHeight: 1.2,
              }}>
                {initialAlarm ? 'Edit Alarm' : 'New Alarm'}
              </h2>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Configure wake schedule & challenge</div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'var(--accent-bg)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              width: 32, height: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.background = 'rgba(244,63,94,0.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'var(--accent-bg)'; }}
          >
            <X size={15} />
          </button>
        </div>

        {/* ── Scrollable Body ── */}
        <form
          id="alarm-form"
          onSubmit={handleSubmit}
          style={{
            padding: '22px 24px',
            display: 'flex', flexDirection: 'column', gap: 20,
            overflowY: 'auto',
            flex: 1,
          }}
        >
          {/* 12-Hour Wake Time Picker with AM/PM */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>⏰ Wake Time (12-Hour AM/PM)</label>
              <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--accent-mid)', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
                {formatted12hTime}
              </span>
            </div>

            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-strong)',
              borderRadius: 14,
              padding: '12px 18px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
            }}>
              {/* Hour Dropdown */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4 }}>HOUR</span>
                <select
                  value={hour12}
                  onChange={e => setHour12(parseInt(e.target.value, 10))}
                  style={{
                    fontSize: 26,
                    fontWeight: 800,
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    color: 'var(--text)',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    padding: '4px 10px',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                    <option key={h} value={h} style={{ background: 'var(--bg-card)', color: 'var(--text)' }}>
                      {String(h).padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>

              <span style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-muted)', marginTop: 14 }}>:</span>

              {/* Minute Dropdown */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4 }}>MINUTE</span>
                <select
                  value={min12}
                  onChange={e => setMin12(parseInt(e.target.value, 10))}
                  style={{
                    fontSize: 26,
                    fontWeight: 800,
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    color: 'var(--text)',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    padding: '4px 10px',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {Array.from({ length: 60 }, (_, i) => i).map(m => (
                    <option key={m} value={m} style={{ background: 'var(--bg-card)', color: 'var(--text)' }}>
                      {String(m).padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>

              {/* AM / PM Toggle Pills */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginLeft: 6 }}>
                <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4 }}>PERIOD</span>
                <div style={{
                  display: 'flex',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  padding: 3,
                  gap: 3,
                }}>
                  {['AM', 'PM'].map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setAmpm(p)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 7,
                        fontSize: 13,
                        fontWeight: 800,
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        background: ampm === p ? 'linear-gradient(135deg, var(--accent), var(--indigo))' : 'transparent',
                        color: ampm === p ? '#fff' : 'var(--text-muted)',
                        boxShadow: ampm === p ? '0 2px 8px var(--accent-glow)' : 'none',
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Repeat Frequency: Once / Daily / Weekly */}
          <div>
            <label style={labelStyle}>🔄 Repeat Frequency</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
              {FREQUENCIES.map(f => {
                const isSel = frequency === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => handleFrequencyChange(f.id)}
                    style={{
                      padding: '10px 8px',
                      borderRadius: 10,
                      border: isSel ? '1px solid var(--border-glow)' : '1px solid var(--border)',
                      background: isSel ? 'linear-gradient(135deg, var(--accent), var(--indigo))' : 'var(--bg-surface)',
                      color: isSel ? '#fff' : 'var(--text-secondary)',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.15s',
                      boxShadow: isSel ? '0 2px 10px var(--accent-glow)' : 'none',
                    }}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>

            {/* Day Chips */}
            <div style={{ display: 'flex', gap: 6, justifyContent: 'space-between' }}>
              {DAYS.map(d => {
                const on = form.days.includes(d);
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDay(d)}
                    style={{
                      flex: 1, height: 36,
                      borderRadius: 10,
                      border: on ? '1px solid var(--border-glow)' : '1px solid var(--border)',
                      background: on ? 'linear-gradient(135deg, var(--accent), var(--indigo))' : 'var(--bg-surface)',
                      color: on ? '#fff' : 'var(--text-muted)',
                      fontSize: 12, fontWeight: 700,
                      cursor: 'pointer', transition: 'all 0.15s',
                      boxShadow: on ? '0 2px 10px var(--accent-glow)' : 'none',
                    }}
                  >
                    {d.slice(0, 2)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Label */}
          <div>
            <label style={labelStyle}>🏷️ Alarm Label</label>
            <div style={{ position: 'relative' }}>
              <Tag size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input
                type="text"
                value={form.label}
                onChange={e => setForm(p => ({ ...p, label: e.target.value }))}
                placeholder="e.g. Morning Workout, College, Standup"
                required
                className="input"
                style={{ paddingLeft: 38 }}
              />
            </div>
          </div>

          {/* Cognitive Puzzle Type */}
          <div>
            <label style={labelStyle}>🧠 Wake Challenge Category</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8 }}>
              {COGNITIVE_TYPES.map(type => {
                const sel = form.cognitiveType === type.value;
                return (
                  <div
                    key={type.value}
                    onClick={() => setForm(p => ({ ...p, cognitiveType: type.value }))}
                    style={{
                      padding: '10px 12px',
                      background: sel ? 'var(--accent-bg)' : 'var(--bg-surface)',
                      border: sel ? '1px solid var(--border-glow)' : '1px solid var(--border)',
                      borderRadius: 12,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}
                  >
                    <span style={{ fontSize: 18 }}>{type.icon}</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 12, color: sel ? 'var(--text)' : 'var(--text-secondary)' }}>{type.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label style={labelStyle}>⚡ Puzzle Difficulty</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {DIFFICULTIES.map(d => {
                const sel = form.difficulty === d.value;
                return (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setForm(p => ({ ...p, difficulty: d.value }))}
                    style={{
                      padding: '10px',
                      borderRadius: 10,
                      border: sel ? `1px solid ${d.color}` : '1px solid var(--border)',
                      background: sel ? d.bg : 'var(--bg-surface)',
                      color: sel ? d.color : 'var(--text-muted)',
                      fontSize: 12, fontWeight: 700,
                      cursor: 'pointer', textTransform: 'capitalize',
                      transition: 'all 0.15s',
                    }}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Snooze Time Selection */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>💤 Snooze Time</label>
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--accent-mid)',
                background: 'var(--accent-bg)',
                padding: '2px 8px',
                borderRadius: 6,
                border: '1px solid var(--border-strong)',
              }}>
                {snoozeTime} minute{snoozeTime > 1 ? 's' : ''} snooze
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6, marginBottom: 6 }}>
              {SNOOZE_OPTIONS.map(opt => {
                const sel = snoozeTime === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSnoozeTime(opt.value)}
                    style={{
                      padding: '8px 4px',
                      borderRadius: 10,
                      border: sel ? '1px solid var(--border-glow)' : '1px solid var(--border)',
                      background: sel ? 'linear-gradient(135deg, var(--accent), var(--indigo))' : 'var(--bg-surface)',
                      color: sel ? '#fff' : 'var(--text-secondary)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 2,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      boxShadow: sel ? '0 2px 10px var(--accent-glow)' : 'none',
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 800 }}>{opt.label}</span>
                    <span style={{ fontSize: 9, opacity: sel ? 0.95 : 0.65, fontWeight: 600 }}>{opt.badge}</span>
                  </button>
                );
              })}
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
              Alarm will re-trigger in {snoozeTime} minute{snoozeTime > 1 ? 's' : ''} if wake challenge is not solved or snoozed.
            </p>
          </div>

          {/* Sound Preview */}
          <div>
            <label style={labelStyle}>🔔 Alarm Sound</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {SOUNDS.map(s => {
                const sel = form.sound === s.value;
                return (
                  <div
                    key={s.value}
                    onClick={() => {
                      setForm(p => ({ ...p, sound: s.value }));
                      previewSound(s.value);
                    }}
                    style={{
                      padding: '10px 12px',
                      background: sel ? 'var(--accent-bg)' : 'var(--bg-surface)',
                      border: sel ? '1px solid var(--border-glow)' : '1px solid var(--border)',
                      borderRadius: 10,
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      transition: 'all 0.15s',
                    }}
                  >
                    <span style={{ fontSize: 12, fontWeight: 600, color: sel ? 'var(--text)' : 'var(--text-secondary)' }}>
                      {s.icon} {s.label}
                    </span>
                    <Volume2 size={13} color={sel ? 'var(--accent-mid)' : 'var(--text-muted)'} />
                  </div>
                );
              })}
            </div>
          </div>
        </form>

        {/* ── Pinned Footer ── */}
        <div style={{
          display: 'flex', gap: 10,
          padding: '16px 24px',
          borderTop: '1px solid var(--border)',
          background: 'var(--bg-surface)',
          flexShrink: 0,
        }}>
          <button
            type="button"
            className="btn-ghost"
            onClick={onClose}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="alarm-form"
            className="btn-primary"
            style={{ flex: 2, justifyContent: 'center' }}
          >
            {initialAlarm ? 'Save Changes' : 'Create Alarm'}
          </button>
        </div>

      </div>

      <style>{`
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
