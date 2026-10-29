import React, { useState, useEffect, useRef } from 'react';
import { MathPuzzle } from './MathPuzzle';
import { PatternMemoryPuzzle } from './PatternMemoryPuzzle';
import { MemoryFlipPuzzle } from './MemoryFlipPuzzle';
import { StroopColorPuzzle } from './StroopColorPuzzle';
import { WordScramblePuzzle } from './WordScramblePuzzle';
import { startAlarmAudio, stopAlarmAudio } from '../../services/audio';
import { historyAPI, aiAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatTime12h } from '../../utils/timeUtils';
import {
  Bell,
  AlertTriangle,
  Clock,
  Zap,
  Timer,
  CheckCircle2,
  TrendingDown,
  Layers,
  Sparkles,
  RefreshCw,
  ShieldAlert
} from 'lucide-react';

export const LEVEL_ORDER = ['beginner', 'easy', 'medium', 'hard', 'expert'];

export const Q_LEVEL_CONFIG = {
  beginner: {
    levelNum: 1,
    name: 'Beginner',
    questionsCount: 1,
    timePerQuestion: 30, // 30s
    color: '#22c55e',
    badgeBg: 'rgba(34, 197, 94, 0.14)',
    badgeBorder: 'rgba(34, 197, 94, 0.35)',
    pillColor: '#16a34a',
    tag: 'Baseline Tier',
    desc: '1 question • 30s timer'
  },
  easy: {
    levelNum: 2,
    name: 'Easy',
    questionsCount: 2,
    timePerQuestion: 25, // 25s
    color: '#3b82f6',
    badgeBg: 'rgba(59, 130, 246, 0.14)',
    badgeBorder: 'rgba(59, 130, 246, 0.35)',
    pillColor: '#2563eb',
    tag: 'Warmup Tier',
    desc: '2 questions • 25s timer per question'
  },
  medium: {
    levelNum: 3,
    name: 'Medium',
    questionsCount: 3,
    timePerQuestion: 20, // 20s
    color: '#f59e0b',
    badgeBg: 'rgba(245, 158, 11, 0.14)',
    badgeBorder: 'rgba(245, 158, 11, 0.35)',
    pillColor: '#d97706',
    tag: 'Focus Tier',
    desc: '3 questions • 20s timer per question'
  },
  hard: {
    levelNum: 4,
    name: 'Hard',
    questionsCount: 4,
    timePerQuestion: 15, // 15s
    color: '#ea580c',
    badgeBg: 'rgba(234, 88, 12, 0.14)',
    badgeBorder: 'rgba(234, 88, 12, 0.35)',
    pillColor: '#c2410c',
    tag: 'Agility Tier',
    desc: '4 questions • 15s timer per question'
  },
  expert: {
    levelNum: 5,
    name: 'Expert',
    questionsCount: 5,
    timePerQuestion: 12, // 12s
    color: '#8b5cf6',
    badgeBg: 'rgba(139, 92, 246, 0.14)',
    badgeBorder: 'rgba(139, 92, 246, 0.35)',
    pillColor: '#7c3aed',
    tag: 'Mastery Tier',
    desc: '5 questions • 12s timer per question'
  }
};

export function PuzzleModal({ alarm, isOpen, onClose, onSolveComplete }) {
  const { setUser } = useAuth();

  // Normalized initial level
  const rawInitLevel = (alarm?.difficulty || 'medium').toLowerCase();
  const initLevel = LEVEL_ORDER.includes(rawInitLevel) ? rawInitLevel : 'medium';

  // Active state for Q-Learning queue
  const [currentLevel, setCurrentLevel] = useState(initLevel);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(Q_LEVEL_CONFIG[initLevel]?.timePerQuestion || 20);
  const [puzzleKey, setPuzzleKey] = useState(0);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [timeoutsCount, setTimeoutsCount] = useState(0);

  // Informative feedback banners
  const [degradationBanner, setDegradationBanner] = useState(null);
  const [stepToast, setStepToast] = useState(null);

  // References to keep current values fresh inside interval closures
  const currentLevelRef = useRef(currentLevel);
  currentLevelRef.current = currentLevel;

  const currentQIndexRef = useRef(currentQIndex);
  currentQIndexRef.current = currentQIndex;

  const timeLeftRef = useRef(timeLeft);
  timeLeftRef.current = timeLeft;

  // Reset when alarm or isOpen changes
  useEffect(() => {
    if (isOpen && alarm) {
      const lvl = (alarm.difficulty || 'medium').toLowerCase();
      const validLvl = LEVEL_ORDER.includes(lvl) ? lvl : 'medium';
      setCurrentLevel(validLvl);
      setCurrentQIndex(0);
      setTimeLeft(Q_LEVEL_CONFIG[validLvl].timePerQuestion);
      setPuzzleKey(0);
      setElapsedSec(0);
      setTimeoutsCount(0);
      setDegradationBanner(null);
      setStepToast(null);

      startAlarmAudio(alarm.sound || 'energetic', 0.75);
    } else {
      stopAlarmAudio();
    }
  }, [isOpen, alarm]);

  // Main countdown timer and level degradation engine
  useEffect(() => {
    if (!isOpen || !alarm) return;

    // 1-second interval loop
    const timer = setInterval(() => {
      setElapsedSec((prev) => prev + 1);

      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time expired! Trigger Q-based level degradation
          handleTimeoutDegradation();
          const activeLvl = currentLevelRef.current;
          const lvlIdx = LEVEL_ORDER.indexOf(activeLvl);
          const nextLvl = lvlIdx > 0 ? LEVEL_ORDER[lvlIdx - 1] : 'beginner';
          return Q_LEVEL_CONFIG[nextLvl].timePerQuestion;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [isOpen, alarm]);

  // Q-Engine Level Degradation Handler
  const handleTimeoutDegradation = () => {
    const activeLvl = currentLevelRef.current;
    const lvlIdx = LEVEL_ORDER.indexOf(activeLvl);
    setTimeoutsCount((c) => c + 1);

    if (lvlIdx > 0) {
      const degradedLevel = LEVEL_ORDER[lvlIdx - 1];
      const degradedConfig = Q_LEVEL_CONFIG[degradedLevel];
      const prevConfig = Q_LEVEL_CONFIG[activeLvl];

      setCurrentLevel(degradedLevel);
      setCurrentQIndex(0);
      setTimeLeft(degradedConfig.timePerQuestion);
      setPuzzleKey((k) => k + 1);

      setDegradationBanner({
        type: 'degraded',
        from: prevConfig.name,
        to: degradedConfig.name,
        fromCount: prevConfig.questionsCount,
        toCount: degradedConfig.questionsCount,
        timePerQ: degradedConfig.timePerQuestion,
        message: `⚡ Q-Timer Expired! Cognitive Q-engine dropped difficulty 1 level down: ${prevConfig.name} → ${degradedConfig.name}. Q-Line resized to ${degradedConfig.questionsCount} question${degradedConfig.questionsCount > 1 ? 's' : ''}.`
      });
    } else {
      // Already at Beginner (Level 1) - lowest bound
      const begConfig = Q_LEVEL_CONFIG['beginner'];
      setCurrentQIndex(0);
      setTimeLeft(begConfig.timePerQuestion);
      setPuzzleKey((k) => k + 1);

      setDegradationBanner({
        type: 'warning',
        from: 'Beginner',
        to: 'Beginner',
        fromCount: 1,
        toCount: 1,
        timePerQ: begConfig.timePerQuestion,
        message: `⏰ Q-Timer Expired! Base level reached (Beginner). Timer reset to ${begConfig.timePerQuestion}s — complete to disarm!`
      });
    }
  };

  // When active puzzle is answered successfully
  const handleQuestionSuccess = () => {
    const activeLvl = currentLevelRef.current;
    const totalQ = Q_LEVEL_CONFIG[activeLvl].questionsCount;
    const currentIdx = currentQIndexRef.current;
    const nextIdx = currentIdx + 1;

    if (nextIdx < totalQ) {
      // Advance to next question in Q-line queue!
      setCurrentQIndex(nextIdx);
      setTimeLeft(Q_LEVEL_CONFIG[activeLvl].timePerQuestion);
      setPuzzleKey((k) => k + 1);
      setStepToast({
        message: `✓ Question ${nextIdx} of ${totalQ} Cleared! Advance to next challenge in queue.`
      });
      setTimeout(() => setStepToast(null), 3000);
    } else {
      // All questions in Q-Line completed!
      handleFinalSuccess();
    }
  };

  // Disarm alarm on full Q-Line completion
  const handleFinalSuccess = async () => {
    stopAlarmAudio();
    const t = `${Math.max(1, elapsedSec)}s`;
    const finalLvl = currentLevelRef.current;
    const totalQ = Q_LEVEL_CONFIG[finalLvl].questionsCount;

    try {
      const res = await historyAPI.addHistoryLog({
        alarmLabel: alarm.label || 'Alarm',
        status: 'Success',
        puzzleType: alarm.cognitiveType || 'math',
        solveTime: t,
        difficulty: finalLvl,
        qLineCompleted: true,
        totalQuestions: totalQ
      });
      if (res?.user) setUser(res.user);

      // Submit rich telemetry to RL Q-Engine
      aiAPI.completeSession({
        recommended_time: alarm.time || '07:00',
        challenge: alarm.cognitiveType || 'math',
        difficulty: finalLvl,
        initial_difficulty: alarm.difficulty || 'medium',
        snooze_limit: alarm.snoozeTime || 3,
        status: 'Success',
        solve_time: Math.max(1, elapsedSec),
        accuracy: timeoutsCount > 0 ? Math.max(50, 96 - timeoutsCount * 12) : 98.0,
        q_line_completed: true,
        total_questions: totalQ,
        timeout_count: timeoutsCount,
      }).catch((err) => console.warn('AI RL session log notice:', err));
    } catch (err) {
      console.error(err);
    }

    if (onSolveComplete) onSolveComplete('Success', t);
    onClose();
  };

  // Snooze handler
  const handleSnooze = async () => {
    stopAlarmAudio();
    const t = `${elapsedSec}s`;
    try {
      const res = await historyAPI.addHistoryLog({
        alarmLabel: alarm.label || 'Alarm',
        status: 'Snoozed',
        puzzleType: alarm.cognitiveType || 'math',
        solveTime: t
      });
      if (res?.user) setUser(res.user);

      // Feed snooze penalty to RL & XGBoost Engine
      aiAPI.completeSession({
        recommended_time: alarm.time || '07:00',
        challenge: alarm.cognitiveType || 'math',
        difficulty: currentLevelRef.current,
        initial_difficulty: alarm.difficulty || 'medium',
        snooze_limit: alarm.snoozeTime || 3,
        status: 'Snoozed',
        snooze_count: 1,
        solve_time: Math.max(1, elapsedSec),
        accuracy: 40.0,
        timeout_count: timeoutsCount
      }).catch((err) => console.warn('AI RL session log notice:', err));
    } catch (err) {
      console.error(err);
    }
    if (onSolveComplete) onSolveComplete('Snoozed', t);
    onClose();
  };

  if (!isOpen || !alarm) return null;

  const activeConfig = Q_LEVEL_CONFIG[currentLevel] || Q_LEVEL_CONFIG['medium'];
  const totalQuestions = activeConfig.questionsCount;
  const timeProgressPercent = Math.max(0, Math.min(100, (timeLeft / activeConfig.timePerQuestion) * 100));

  // Dynamic timer color status
  const isUrgent = timeLeft <= 5;
  const isWarning = timeLeft <= 10 && !isUrgent;
  const timerColor = isUrgent ? '#ef4444' : isWarning ? '#f59e0b' : '#22c55e';

  const renderPuzzle = () => {
    const type = alarm.cognitiveType || 'math';
    const diff = currentLevel;
    const dynamicKey = `${currentLevel}-q${currentQIndex}-k${puzzleKey}`;

    switch (type) {
      case 'pattern':
        return <PatternMemoryPuzzle key={dynamicKey} difficulty={diff} onSuccess={handleQuestionSuccess} onFail={handleTimeoutDegradation} />;
      case 'memory':
        return <MemoryFlipPuzzle key={dynamicKey} difficulty={diff} onSuccess={handleQuestionSuccess} onFail={handleTimeoutDegradation} />;
      case 'stroop':
        return <StroopColorPuzzle key={dynamicKey} difficulty={diff} onSuccess={handleQuestionSuccess} onFail={handleTimeoutDegradation} />;
      case 'word':
        return <WordScramblePuzzle key={dynamicKey} difficulty={diff} onSuccess={handleQuestionSuccess} onFail={handleTimeoutDegradation} />;
      default:
        return <MathPuzzle key={dynamicKey} difficulty={diff} onSuccess={handleQuestionSuccess} onFail={handleTimeoutDegradation} />;
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        width: '100%', maxWidth: 540,
        background: 'var(--bg-surface, #ffffff)',
        border: '1px solid var(--border, rgba(67,47,46,0.15))',
        borderRadius: 16,
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Alarm Header Bar */}
        <div style={{
          background: 'linear-gradient(135deg, #b33939 0%, #8b2323 100%)',
          padding: '14px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          color: '#fff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'rgba(255,255,255,0.18)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'pulse 1.5s infinite ease-in-out'
            }}>
              <Bell size={20} color="#fff" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.01em' }}>
                {formatTime12h(alarm.time)} — {alarm.label || 'Alarm'}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span>Adaptive Q-Learning Wake Engine</span>
              </div>
            </div>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(0,0,0,0.25)',
            padding: '5px 12px', borderRadius: 8,
            fontSize: 13, fontWeight: 700,
            fontVariantNumeric: 'tabular-nums',
            border: '1px solid rgba(255,255,255,0.15)'
          }}>
            <Clock size={13} />
            {elapsedSec}s
          </div>
        </div>

        {/* Q-LINE HUD PANEL */}
        <div style={{
          padding: '14px 20px',
          background: 'var(--bg-hover, #f3ede2)',
          borderBottom: '1px solid var(--border, rgba(67,47,46,0.12))',
          display: 'flex', flexDirection: 'column', gap: 10
        }}>
          {/* Top row: Q-Line status & Level badge */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                background: 'var(--accent, #432f2e)',
                color: '#fff',
                padding: '3px 8px',
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '0.04em',
                display: 'flex', alignItems: 'center', gap: 4
              }}>
                <Zap size={11} fill="#fff" />
                Q-LINE QUEUE
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text, #432f2e)' }}>
                Question {currentQIndex + 1} of {totalQuestions}
              </span>
            </div>

            {/* Current Level Badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: activeConfig.badgeBg,
              border: `1px solid ${activeConfig.badgeBorder}`,
              padding: '3px 10px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 800,
              color: activeConfig.color,
              transition: 'all 0.3s ease'
            }}>
              <span style={{
                width: 7, height: 7, borderRadius: '50%',
                backgroundColor: activeConfig.color,
                boxShadow: `0 0 6px ${activeConfig.color}`
              }} />
              Level {activeConfig.levelNum}: {activeConfig.name}
            </div>
          </div>

          {/* Stepper Progress Dots / Track */}
          <div style={{ display: 'flex', gap: 6 }}>
            {Array.from({ length: totalQuestions }).map((_, idx) => {
              const isDone = idx < currentQIndex;
              const isCurrent = idx === currentQIndex;
              return (
                <div
                  key={idx}
                  style={{
                    flex: 1,
                    height: 28,
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 5,
                    fontSize: 11,
                    fontWeight: 700,
                    transition: 'all 0.25s ease',
                    background: isDone
                      ? 'rgba(44, 119, 80, 0.15)'
                      : isCurrent
                      ? activeConfig.badgeBg
                      : 'rgba(67, 47, 46, 0.05)',
                    border: isDone
                      ? '1px solid rgba(44, 119, 80, 0.4)'
                      : isCurrent
                      ? `2px solid ${activeConfig.color}`
                      : '1px solid var(--border, rgba(67,47,46,0.1))',
                    color: isDone
                      ? '#2c7750'
                      : isCurrent
                      ? activeConfig.color
                      : 'var(--text-muted, #957e7d)'
                  }}
                >
                  {isDone ? (
                    <>
                      <CheckCircle2 size={12} color="#2c7750" />
                      <span>Q{idx + 1}</span>
                    </>
                  ) : isCurrent ? (
                    <>
                      <span style={{
                        width: 6, height: 6, borderRadius: '50%',
                        backgroundColor: activeConfig.color,
                        animation: 'pulse 1s infinite'
                      }} />
                      <span>Q{idx + 1} (Active)</span>
                    </>
                  ) : (
                    <span>Q{idx + 1}</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Question Countdown Timer Gauge */}
          <div style={{
            background: 'var(--bg-card, #ffffff)',
            border: '1px solid var(--border, rgba(67,47,46,0.12))',
            borderRadius: 8,
            padding: '8px 12px',
            display: 'flex', flexDirection: 'column', gap: 6
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary, #68504f)', fontWeight: 600 }}>
                <Timer size={13} color={timerColor} />
                <span>Timer Per Question</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted, #957e7d)' }}>
                  (No attempt in time = drops 1 level down)
                </span>
              </div>
              <div style={{
                fontWeight: 800,
                fontSize: 13,
                color: timerColor,
                fontVariantNumeric: 'tabular-nums',
                display: 'flex', alignItems: 'center', gap: 4,
                animation: isUrgent ? 'pulse 0.8s infinite' : 'none'
              }}>
                {timeLeft}s remaining
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div style={{
              width: '100%', height: 6,
              background: 'rgba(67, 47, 46, 0.08)',
              borderRadius: 999,
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${timeProgressPercent}%`,
                backgroundColor: timerColor,
                borderRadius: 999,
                transition: 'width 1s linear, background-color 0.3s ease'
              }} />
            </div>
          </div>
        </div>

        {/* Dynamic Degradation Notification Banner */}
        {degradationBanner && (
          <div style={{
            padding: '10px 18px',
            background: degradationBanner.type === 'degraded' ? 'rgba(234, 88, 12, 0.12)' : 'rgba(245, 158, 11, 0.14)',
            borderBottom: `1px solid ${degradationBanner.type === 'degraded' ? 'rgba(234, 88, 12, 0.35)' : 'rgba(245, 158, 11, 0.35)'}`,
            display: 'flex', alignItems: 'center', gap: 10,
            animation: 'slideDown 0.3s ease-out'
          }}>
            <TrendingDown size={18} color="#ea580c" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: 12, color: '#9a3412', fontWeight: 600, lineHeight: 1.4 }}>
              {degradationBanner.message}
            </div>
          </div>
        )}

        {/* Step Success Toast */}
        {stepToast && (
          <div style={{
            padding: '8px 18px',
            background: 'rgba(44, 119, 80, 0.12)',
            borderBottom: '1px solid rgba(44, 119, 80, 0.35)',
            display: 'flex', alignItems: 'center', gap: 8,
            animation: 'slideDown 0.25s ease-out'
          }}>
            <Sparkles size={16} color="#2c7750" />
            <div style={{ fontSize: 12, color: '#2c7750', fontWeight: 700 }}>
              {stepToast.message}
            </div>
          </div>
        )}

        {/* Active Puzzle Challenge Area */}
        <div style={{
          background: 'var(--bg-subtle, #faf7f2)',
          borderBottom: '1px solid var(--border, rgba(67,47,46,0.12))',
          padding: '16px 20px',
          minHeight: 220,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          {renderPuzzle()}
        </div>

        {/* Footer & Snooze Controls */}
        <div style={{
          padding: '12px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 12,
          background: 'var(--bg-surface, #ffffff)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--text-muted, #957e7d)' }}>
            <AlertTriangle size={14} color="var(--warning, #b87414)" />
            <span>Snoozing resets your streak & cognitive RL reward</span>
          </div>
          <button
            onClick={handleSnooze}
            className="btn-ghost"
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--danger, #b33939)',
              borderColor: 'var(--border, rgba(67,47,46,0.15))',
              padding: '6px 14px',
              borderRadius: 8,
              cursor: 'pointer',
              flexShrink: 0
            }}
          >
            💤 Snooze ({alarm.snoozeTime || 5}m)
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.08); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
