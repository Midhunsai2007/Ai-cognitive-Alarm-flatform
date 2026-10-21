import React, { useState, useEffect } from 'react';
import { MathPuzzle } from './MathPuzzle';
import { PatternMemoryPuzzle } from './PatternMemoryPuzzle';
import { MemoryFlipPuzzle } from './MemoryFlipPuzzle';
import { StroopColorPuzzle } from './StroopColorPuzzle';
import { WordScramblePuzzle } from './WordScramblePuzzle';
import { startAlarmAudio, stopAlarmAudio } from '../../services/audio';
import { historyAPI, aiAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatTime12h } from '../../utils/timeUtils';
import { Bell, AlertTriangle, Clock, X } from 'lucide-react';

export function PuzzleModal({ alarm, isOpen, onClose, onSolveComplete }) {
  const { setUser } = useAuth();
  const [startTime] = useState(Date.now());
  const [elapsedSec, setElapsedSec] = useState(0);

  useEffect(() => {
    if (isOpen && alarm) {
      startAlarmAudio(alarm.sound || 'energetic', 0.75);
      const timer = setInterval(() => setElapsedSec(Math.floor((Date.now() - startTime) / 1000)), 1000);
      return () => { clearInterval(timer); stopAlarmAudio(); };
    } else {
      stopAlarmAudio();
    }
  }, [isOpen, alarm]);

  if (!isOpen || !alarm) return null;

  const handleSuccess = async () => {
    stopAlarmAudio();
    const t = `${Math.max(1, elapsedSec)}s`;
    try {
      const res = await historyAPI.addHistoryLog({ alarmLabel: alarm.label || 'Alarm', status: 'Success', puzzleType: alarm.cognitiveType || 'math', solveTime: t });
      if (res?.user) setUser(res.user);
      
      // Feed telemetry to RL & XGBoost Engine
      aiAPI.completeSession({
        recommended_time: alarm.time || '07:00',
        challenge: alarm.cognitiveType || 'math',
        difficulty: alarm.difficulty || 'medium',
        snooze_limit: alarm.snoozeTime || 3,
        status: 'Success',
        solve_time: Math.max(1, elapsedSec),
        accuracy: 95.0,
      }).catch(err => console.warn('AI RL session log notice:', err));
    } catch (err) { console.error(err); }
    if (onSolveComplete) onSolveComplete('Success', t);
    onClose();
  };

  const handleSnooze = async () => {
    stopAlarmAudio();
    const t = `${elapsedSec}s`;
    try {
      const res = await historyAPI.addHistoryLog({ alarmLabel: alarm.label || 'Alarm', status: 'Snoozed', puzzleType: alarm.cognitiveType || 'math', solveTime: t });
      if (res?.user) setUser(res.user);

      // Feed snooze penalty to RL & XGBoost Engine
      aiAPI.completeSession({
        recommended_time: alarm.time || '07:00',
        challenge: alarm.cognitiveType || 'math',
        difficulty: alarm.difficulty || 'medium',
        snooze_limit: alarm.snoozeTime || 3,
        status: 'Snoozed',
        snooze_count: 1,
        solve_time: Math.max(1, elapsedSec),
        accuracy: 40.0,
      }).catch(err => console.warn('AI RL session log notice:', err));
    } catch (err) { console.error(err); }
    if (onSolveComplete) onSolveComplete('Snoozed', t);
    onClose();
  };

  const renderPuzzle = () => {
    const type = alarm.cognitiveType || 'math';
    const diff = alarm.difficulty || 'medium';
    switch (type) {
      case 'pattern': return <PatternMemoryPuzzle difficulty={diff} onSuccess={handleSuccess} onFail={handleSnooze} />;
      case 'memory': return <MemoryFlipPuzzle difficulty={diff} onSuccess={handleSuccess} onFail={handleSnooze} />;
      case 'stroop': return <StroopColorPuzzle difficulty={diff} onSuccess={handleSuccess} onFail={handleSnooze} />;
      case 'word': return <WordScramblePuzzle difficulty={diff} onSuccess={handleSuccess} onFail={handleSnooze} />;
      default: return <MathPuzzle difficulty={diff} onSuccess={handleSuccess} onFail={handleSnooze} />;
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}>
      <div style={{
        width: '100%', maxWidth: 480,
        background: 'var(--bg)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        boxShadow: '0 12px 48px rgba(0,0,0,0.25)',
        overflow: 'hidden',
      }}>
        {/* Alarm header bar */}
        <div style={{
          background: 'var(--danger)',
          padding: '14px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Bell size={18} color="#fff" />
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#fff' }}>{formatTime12h(alarm.time)} — {alarm.label}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>Solve the challenge to disarm the alarm</div>
            </div>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: 'rgba(0,0,0,0.2)',
            padding: '4px 10px', borderRadius: 6,
            fontSize: 13, fontWeight: 600, color: '#fff',
            fontVariantNumeric: 'tabular-nums',
          }}>
            <Clock size={12} />
            {elapsedSec}s
          </div>
        </div>

        {/* Puzzle area */}
        <div style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
          {renderPuzzle()}
        </div>

        {/* Snooze footer */}
        <div style={{
          padding: '12px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--text-muted)' }}>
            <AlertTriangle size={13} color="var(--warning)" />
            <span>Snooze for {alarm.snoozeTime || 5}m (resets streak)</span>
          </div>
          <button
            onClick={handleSnooze}
            className="btn-ghost"
            style={{ fontSize: 12, color: 'var(--danger)', borderColor: 'var(--border)', flexShrink: 0 }}
          >
            💤 Snooze ({alarm.snoozeTime || 5}m)
          </button>
        </div>
      </div>
    </div>
  );
}
