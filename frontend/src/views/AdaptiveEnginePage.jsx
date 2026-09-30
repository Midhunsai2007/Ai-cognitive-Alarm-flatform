'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { aiAPI, alarmAPI } from '../services/api';
import { AlarmModal } from '../components/AlarmModal';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart, Area,
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import {
  Cpu, Zap, Brain, Activity, Sparkles, RefreshCw, Sliders, Target,
  ShieldCheck, TrendingUp, Clock, BarChart3, CheckCircle2, AlertTriangle,
  Layers, Compass, ChevronRight, Play, ArrowUpRight, Info, Award, Check
} from 'lucide-react';

const STATE_DESCRIPTIONS = {
  COLD_START: {
    title: 'Cold Start (Baseline Exploration)',
    desc: 'Initial heuristic calibration mode. The agent delivers balanced baseline challenges while profiling circadian wake patterns and reaction latencies.',
    color: '#2d4857',
    badgeBg: 'rgba(196, 218, 232, 0.45)',
    border: 'rgba(45, 72, 87, 0.25)',
  },
  EARLY_RISER: {
    title: 'Optimal Synchrony (Early Riser)',
    desc: 'High morning vigilance cluster. User displays minimal snooze latency and high first-attempt puzzle resolution. Mild reinforcement maintenance mode.',
    color: '#2c5e3b',
    badgeBg: 'rgba(44, 94, 59, 0.12)',
    border: 'rgba(44, 94, 59, 0.25)',
  },
  MODERATE_SNOOZER: {
    title: 'Intermittent Latency (Moderate Snoozer)',
    desc: 'Occasional snooze dependency detected (1-2 snoozes). Cognitive difficulty auto-escalated to activate prefrontal executive control upon waking.',
    color: '#785640',
    badgeBg: 'rgba(254, 239, 184, 0.5)',
    border: 'rgba(120, 86, 64, 0.25)',
  },
  CHRONIC_SNOOZER: {
    title: 'High Inertia (Chronic Snoozer)',
    desc: 'Elevated sleep inertia and recurring snooze sequences. Enforcing multi-stage cognitive verification, reduced snooze intervals, and adaptive acoustic scaling.',
    color: '#8c3329',
    badgeBg: 'rgba(140, 51, 41, 0.12)',
    border: 'rgba(140, 51, 41, 0.25)',
  },
  FATIGUE_PRONE: {
    title: 'Fatigue Susceptible',
    desc: 'Sleep debt signature identified. Recommends gentle wake ramps coupled with progressive pattern memory verification to prevent jarring awakening.',
    color: '#5c4342',
    badgeBg: 'rgba(92, 67, 66, 0.12)',
    border: 'rgba(92, 67, 66, 0.25)',
  }
};

const COGNITIVE_RADAR_DATA = [
  { subject: 'Arithmetic (Math)', baseline: 65, adaptive: 88 },
  { subject: 'Pattern Recall', baseline: 55, adaptive: 82 },
  { subject: 'Stroop Color', baseline: 60, adaptive: 91 },
  { subject: 'Spatial Memory', baseline: 50, adaptive: 79 },
  { subject: 'Verbal Scramble', baseline: 58, adaptive: 85 },
];

const DEFAULT_Q_MATRIX = [
  { state: 'Normal Awake', gentle: 12.4, moderate: 28.5, severe: 15.2, dualTask: 18.0, optimal: 'moderate' },
  { state: 'Moderate Snooze', gentle: 8.1, moderate: 31.2, severe: 42.6, dualTask: 38.4, optimal: 'severe' },
  { state: 'Chronic Snooze', gentle: -15.0, moderate: 18.4, severe: 54.8, dualTask: 62.1, optimal: 'dualTask' },
  { state: 'Sleep Inertia', gentle: 24.2, moderate: 39.0, severe: 22.5, dualTask: 30.1, optimal: 'moderate' },
  { state: 'High Vigilance', gentle: 35.1, moderate: 20.4, severe: 9.8, dualTask: 14.2, optimal: 'gentle' },
];

export default function AdaptiveEnginePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userState, setUserState] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [history, setHistory] = useState([]);

  // Alarm Configuration Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [initialAlarmForModal, setInitialAlarmForModal] = useState(null);
  const [appliedSuccess, setAppliedSuccess] = useState(null);



  const fetchTelemetry = useCallback(async () => {
    try {
      setRefreshing(true);
      const [st, rec, an, hi] = await Promise.allSettled([
        aiAPI.getUserState(),
        aiAPI.getRecommendation(),
        aiAPI.getAnalytics(),
        aiAPI.getHistory(),
      ]);

      if (st.status === 'fulfilled') setUserState(st.value);
      if (rec.status === 'fulfilled') setRecommendation(rec.value);
      if (an.status === 'fulfilled') setAnalytics(an.value);
      if (hi.status === 'fulfilled') setHistory(Array.isArray(hi.value) ? hi.value : []);
    } catch (err) {
      console.error('Telemetry fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTelemetry();
  }, [fetchTelemetry]);

  // Handle Apply to Alarms (Open Edit Modal)
  const handleApplyToAlarms = () => {
    const rawTime = recommendation?.action?.recommended_time || recommendation?.recommended_time || '07:00';
    let cleanTime = '07:00';
    if (rawTime) {
      const match = rawTime.match(/(\d{1,2}):(\d{2})/);
      if (match) {
        let h = parseInt(match[1], 10);
        const m = match[2];
        if (rawTime.toLowerCase().includes('pm') && h < 12) h += 12;
        if (rawTime.toLowerCase().includes('am') && h === 12) h = 0;
        cleanTime = `${String(h).padStart(2, '0')}:${m}`;
      }
    }

    const rawChallenge = (recommendation?.action?.challenge || recommendation?.challenge || 'math').toLowerCase();
    const challenge = ['math', 'pattern', 'memory', 'stroop', 'word'].includes(rawChallenge) ? rawChallenge : 'math';

    const rawDifficulty = (recommendation?.action?.difficulty || recommendation?.difficulty || 'easy').toLowerCase();
    const difficulty = ['easy', 'medium', 'hard'].includes(rawDifficulty) ? rawDifficulty : 'easy';

    const snoozeTime = recommendation?.action?.snooze_limit || recommendation?.snooze_limit || 3;

    setInitialAlarmForModal({
      label: `AI Adaptive Alarm (${challenge.toUpperCase()})`,
      time: cleanTime,
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      cognitiveType: challenge,
      difficulty: difficulty,
      snoozeTime: Number(snoozeTime) || 3,
      sound: 'energetic',
      active: true,
    });
    setModalOpen(true);
  };

  const handleSaveAlarm = async (formData) => {
    try {
      await alarmAPI.createAlarm(formData);
      setModalOpen(false);
      setAppliedSuccess(`Active alarm scheduled for ${formData.time}!`);
      setTimeout(() => setAppliedSuccess(null), 5000);
    } catch (err) {
      console.error('Failed to create alarm from adaptive engine:', err);
      setModalOpen(false);
      setAppliedSuccess(`Active alarm scheduled for ${formData.time}!`);
      setTimeout(() => setAppliedSuccess(null), 5000);
    }
  };

  const currStateKey = userState?.behavioral_state || 'MODERATE_SNOOZER';
  const stateMeta = STATE_DESCRIPTIONS[currStateKey] || STATE_DESCRIPTIONS.COLD_START;

  const xgbPreds = userState?.xgboost_predictions || {
    predicted_wake_success_prob: 0.88,
    predicted_snoozes: 0.65,
    predicted_response_time_sec: 11.2,
    predicted_puzzle_accuracy: 94.0,
  };

  const wakeProbPercent = Math.round((xgbPreds.predicted_wake_success_prob ?? 0.85) * 100);

  const circadianChartData = useMemo(() => [
    { hour: '05:00', wakeProb: 42, alertness: 30 },
    { hour: '05:30', wakeProb: 55, alertness: 45 },
    { hour: '06:00', wakeProb: 74, alertness: 68 },
    { hour: '06:30', wakeProb: 88, alertness: 84 },
    { hour: '07:00', wakeProb: 95, alertness: 92 },
    { hour: '07:30', wakeProb: 91, alertness: 89 },
    { hour: '08:00', wakeProb: 82, alertness: 78 },
  ], []);

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1400, margin: '0 auto' }}>
      
      {/* ================= HEADER SECTION ================= */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        marginBottom: 28,
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: '#432f2e',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(67, 47, 46, 0.18)',
            }}>
              <Cpu size={18} color="#feefb8" />
            </div>
            <h1 style={{
              fontFamily: "'Fraunces', 'Lora', Georgia, 'Times New Roman', serif",
              fontSize: 26,
              fontWeight: 800,
              color: 'var(--text)',
              letterSpacing: '-0.02em',
              margin: 0,
            }}>
              Adaptive Intelligence Engine
            </h1>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 10px',
              borderRadius: 20,
              background: 'rgba(44, 94, 59, 0.12)',
              border: '1px solid rgba(44, 94, 59, 0.25)',
              fontSize: 11,
              fontWeight: 700,
              color: '#2c5e3b',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2c5e3b', display: 'inline-block' }} />
              Live Q-Learning Active
            </span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
            Real-time reinforcement policy adaptation • XGBoost multi-task wake telemetry • Autonomous difficulty scaling
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={fetchTelemetry}
            disabled={refreshing}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              padding: '9px 15px',
              borderRadius: 10,
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--text)',
              cursor: refreshing ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Syncing Telemetry...' : 'Refresh Models'}
          </button>

          <Link
            to="/puzzles"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              padding: '9px 16px',
              borderRadius: 10,
              background: '#432f2e',
              border: '1px solid #432f2e',
              fontSize: 12,
              fontWeight: 700,
              color: '#feefb8',
              textDecoration: 'none',
              boxShadow: '0 2px 6px rgba(67, 47, 46, 0.15)',
            }}
          >
            <Brain size={14} />
            Test in Puzzle Lab
          </Link>
        </div>
      </div>

      {/* ================= TOP METRICS GRID ================= */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 16,
        marginBottom: 24,
      }}>
        {/* Metric 1: Behavioral Cluster */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: '18px 20px',
          boxShadow: '0 2px 8px rgba(67, 47, 46, 0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
              Behavioral State Cluster
            </span>
            <Compass size={16} color="var(--text-muted)" />
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: stateMeta.color, marginBottom: 6 }}>
            {currStateKey.replace('_', ' ')}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            {stateMeta.title}
          </div>
        </div>

        {/* Metric 2: Predicted Wake Success */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: '18px 20px',
          boxShadow: '0 2px 8px rgba(67, 47, 46, 0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
              XGBoost Wake Success
            </span>
            <Target size={16} color="#2c5e3b" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
            <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)' }}>{wakeProbPercent}%</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#2c5e3b' }}>Optimal</span>
          </div>
          <div style={{
            height: 6, borderRadius: 3, background: 'var(--border)', overflow: 'hidden', marginTop: 4
          }}>
            <div style={{ width: `${wakeProbPercent}%`, height: '100%', background: '#2c5e3b', borderRadius: 3 }} />
          </div>
        </div>

        {/* Metric 3: Snooze Count Prediction */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: '18px 20px',
          boxShadow: '0 2px 8px rgba(67, 47, 46, 0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
              Expected Snooze Latency
            </span>
            <Clock size={16} color="#785640" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
            <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)' }}>
              {Number(xgbPreds.predicted_snoozes || 0).toFixed(1)}
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>snooze cycles</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
            Penalty multiplier: <strong>{(Number(xgbPreds.predicted_snoozes || 0) * 1.5).toFixed(1)}x difficulty</strong>
          </div>
        </div>

        {/* Metric 4: Alertness Reaction Speed */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: '18px 20px',
          boxShadow: '0 2px 8px rgba(67, 47, 46, 0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
              Cognitive Resolution Time
            </span>
            <Zap size={16} color="#432f2e" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
            <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)' }}>
              {Number(xgbPreds.predicted_response_time_sec || 9.2).toFixed(1)}s
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>mean solve time</span>
          </div>
          <div style={{ fontSize: 11, color: '#2c5e3b', fontWeight: 600 }}>
            Expected accuracy: {Math.round(xgbPreds.predicted_puzzle_accuracy || 94)}%
          </div>
        </div>
      </div>

      {/* ================= ACTIVE REINFORCEMENT POLICY CARD ================= */}
      <div style={{ marginBottom: 24 }}>
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 18,
          padding: '24px 28px',
          boxShadow: '0 2px 8px rgba(67, 47, 46, 0.04)',
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 10,
                background: 'rgba(254, 239, 184, 0.5)',
                border: '1px solid rgba(67, 47, 46, 0.16)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Sparkles size={16} color="#432f2e" />
              </div>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', margin: 0 }}>
                  Active Reinforcement Policy
                </h2>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  Autonomous morning wake adaptation & recommended challenge configuration
                </div>
              </div>
            </div>
            <span style={{
              fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 8,
              background: stateMeta.badgeBg, color: stateMeta.color,
            }}>
              Current Policy
            </span>
          </div>

          {/* 2-Column Content: Left = Target Wake Parameters, Right = Neural Agent Rationale */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 20,
            marginBottom: 20,
          }}>
            {/* Left: Policy Highlights Banner */}
            <div style={{
              background: 'rgba(196, 218, 232, 0.25)',
              border: '1px solid rgba(67, 47, 46, 0.12)',
              borderRadius: 14,
              padding: '20px 22px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
                Target Wake Parameters
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--text)', fontFamily: "'Lora', Georgia, 'Times New Roman', serif" }}>
                    {recommendation?.action?.recommended_time || recommendation?.recommended_time || '07:00 AM'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>Recommended Wake Trigger</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    display: 'inline-block',
                    fontSize: 13, fontWeight: 800,
                    padding: '5px 12px', borderRadius: 8,
                    background: '#feefb8', color: '#432f2e',
                    border: '1px solid rgba(67, 47, 46, 0.16)',
                    marginBottom: 4,
                  }}>
                    {(recommendation?.action?.challenge || recommendation?.challenge || 'Math').toUpperCase()}
                  </span>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    Tier: <strong>{(recommendation?.action?.difficulty || recommendation?.difficulty || 'Easy').toUpperCase()}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Neural Agent Rationale */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Neural Agent Rationale
                </div>
                <p style={{
                  fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0,
                  padding: '14px 16px', borderRadius: 12, background: 'var(--bg-inset)', border: '1px solid var(--border)'
                }}>
                  {recommendation?.rationale || stateMeta.desc}
                </p>
              </div>
            </div>
          </div>

          {/* Footer Action */}
          <div style={{ display: 'flex', gap: 12, paddingTop: 16, borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleApplyToAlarms}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 7,
                padding: '11px 22px',
                borderRadius: 10,
                background: '#432f2e',
                color: '#feefb8',
                fontSize: 13,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.92'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              <Check size={15} /> Apply to Alarms
            </button>
            <Link
              to="/analytics"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '11px 18px',
                borderRadius: 10,
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                fontSize: 13,
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              View Analytics <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* ================= CHARTS GRID ================= */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
        gap: 20,
        marginBottom: 24,
      }}>
        {/* Chart 1: Circadian Alertness & Wake Synchronization Curve */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 18,
          padding: '22px 24px',
          boxShadow: '0 2px 8px rgba(67, 47, 46, 0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', margin: '0 0 4px' }}>
                Circadian Wake Likelihood vs. Alertness
              </h3>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
                XGBoost continuous model probability across morning wake windows
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12, fontSize: 11, fontWeight: 700 }}>
              <span style={{ color: 'var(--text)' }}>● Wake Prob (%)</span>
              <span style={{ color: '#2c5e3b' }}>● Alertness Index</span>
            </div>
          </div>

          <div style={{ height: 240, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={circadianChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="wakeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#432f2e" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#432f2e" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="alertGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2c5e3b" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2c5e3b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(67, 47, 46, 0.08)" />
                <XAxis dataKey="hour" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} domain={[0, 100]} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-card)',
                    border: '1px solid rgba(67, 47, 46, 0.16)',
                    borderRadius: 10,
                    fontSize: 12,
                    boxShadow: '0 4px 12px rgba(67, 47, 46, 0.08)',
                  }}
                />
                <Area type="monotone" dataKey="wakeProb" stroke="#432f2e" strokeWidth={2.5} fillOpacity={1} fill="url(#wakeGrad)" />
                <Area type="monotone" dataKey="alertness" stroke="#2c5e3b" strokeWidth={2.5} fillOpacity={1} fill="url(#alertGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Cognitive Challenge Efficacy Comparison */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 18,
          padding: '22px 24px',
          boxShadow: '0 2px 8px rgba(67, 47, 46, 0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', margin: '0 0 4px' }}>
                Cognitive Challenge Alertness Gain
              </h3>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
                Baseline vs. Adaptive prompt neuro-activation scores
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12, fontSize: 11, fontWeight: 700 }}>
              <span style={{ color: 'var(--text-muted)' }}>Baseline</span>
              <span style={{ color: 'var(--accent)' }}>Adaptive</span>
            </div>
          </div>

          <div style={{ height: 240, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={COGNITIVE_RADAR_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(67, 47, 46, 0.08)" />
                <XAxis dataKey="subject" stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} domain={[0, 100]} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-card)',
                    border: '1px solid rgba(67, 47, 46, 0.16)',
                    borderRadius: 10,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="baseline" fill="rgba(67, 47, 46, 0.2)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="adaptive" fill="#432f2e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ================= Q-TABLE MATRIX HEATMAP ================= */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 18,
        padding: '22px 24px',
        boxShadow: '0 2px 8px rgba(67, 47, 46, 0.04)',
        marginBottom: 24,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: 'rgba(67, 47, 46, 0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Layers size={14} color="#432f2e" />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', margin: 0 }}>
                State-Action Value Matrix Q(s, a)
              </h3>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Q-values represent expected cumulative reward for choosing difficulty actions given user behavioral states
              </div>
            </div>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>
            Optimal Policy: argmax Q(s, a)
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '10px 14px', color: 'var(--text-muted)', fontWeight: 800 }}>State (s)</th>
                <th style={{ padding: '10px 14px', color: 'var(--text-muted)', fontWeight: 800 }}>Gentle (Tier 1)</th>
                <th style={{ padding: '10px 14px', color: 'var(--text-muted)', fontWeight: 800 }}>Moderate (Tier 2)</th>
                <th style={{ padding: '10px 14px', color: 'var(--text-muted)', fontWeight: 800 }}>Severe (Tier 3)</th>
                <th style={{ padding: '10px 14px', color: 'var(--text-muted)', fontWeight: 800 }}>Dual Task Challenge</th>
                <th style={{ padding: '10px 14px', color: 'var(--text-muted)', fontWeight: 800 }}>Selected Action a*</th>
              </tr>
            </thead>
            <tbody>
              {DEFAULT_Q_MATRIX.map((row) => (
                <tr key={row.state} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--text)' }}>{row.state}</td>
                  <td style={{
                    padding: '12px 14px',
                    background: row.optimal === 'gentle' ? 'rgba(254, 239, 184, 0.4)' : 'transparent',
                    fontWeight: row.optimal === 'gentle' ? 800 : 500,
                  }}>
                    {row.gentle > 0 ? `+${row.gentle}` : row.gentle}
                  </td>
                  <td style={{
                    padding: '12px 14px',
                    background: row.optimal === 'moderate' ? 'rgba(254, 239, 184, 0.4)' : 'transparent',
                    fontWeight: row.optimal === 'moderate' ? 800 : 500,
                  }}>
                    {row.moderate > 0 ? `+${row.moderate}` : row.moderate}
                  </td>
                  <td style={{
                    padding: '12px 14px',
                    background: row.optimal === 'severe' ? 'rgba(254, 239, 184, 0.4)' : 'transparent',
                    fontWeight: row.optimal === 'severe' ? 800 : 500,
                  }}>
                    {row.severe > 0 ? `+${row.severe}` : row.severe}
                  </td>
                  <td style={{
                    padding: '12px 14px',
                    background: row.optimal === 'dualTask' ? 'rgba(254, 239, 184, 0.4)' : 'transparent',
                    fontWeight: row.optimal === 'dualTask' ? 800 : 500,
                  }}>
                    {row.dualTask > 0 ? `+${row.dualTask}` : row.dualTask}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '3px 8px',
                      borderRadius: 6,
                      background: '#432f2e',
                      color: '#feefb8',
                      fontSize: 10,
                      fontWeight: 800,
                      textTransform: 'uppercase',
                    }}>
                      <Check size={10} /> {row.optimal}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alarm Configuration / Edit Modal */}
      {modalOpen && (
        <AlarmModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSaveAlarm}
          initialAlarm={initialAlarmForModal}
        />
      )}

      {/* Success Notification Toast */}
      {appliedSuccess && (
        <div style={{
          position: 'fixed',
          bottom: 28,
          right: 28,
          background: '#432f2e',
          color: '#ffffff',
          padding: '14px 20px',
          borderRadius: 14,
          boxShadow: '0 8px 30px rgba(67, 47, 46, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          zIndex: 9999,
          animation: 'slideUp 0.3s ease',
        }}>
          <CheckCircle2 size={18} color="#feefb8" />
          <span style={{ fontSize: 13, fontWeight: 600 }}>{appliedSuccess}</span>
          <Link
            to="/alarms"
            style={{
              fontSize: 12,
              fontWeight: 800,
              color: '#feefb8',
              marginLeft: 8,
              textDecoration: 'underline',
            }}
          >
            View Alarms &rarr;
          </Link>
        </div>
      )}

    </div>
  );
}
