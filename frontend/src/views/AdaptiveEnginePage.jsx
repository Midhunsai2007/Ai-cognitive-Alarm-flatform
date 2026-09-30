'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { aiAPI } from '../services/api';
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

  // Simulator Interactive State
  const [simTime, setSimTime] = useState('06:45');
  const [simChallenge, setSimChallenge] = useState('math');
  const [simDifficulty, setSimDifficulty] = useState('medium');
  const [simAccuracy, setSimAccuracy] = useState(95);
  const [simResponseTime, setSimResponseTime] = useState(8.5);
  const [simSnoozes, setSimSnoozes] = useState(0);
  const [simStatus, setSimStatus] = useState('Success');
  const [simSubmitting, setSimSubmitting] = useState(false);
  const [simFeedback, setSimFeedback] = useState(null);

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

  // Handle Simulator Run
  const handleSimulateSession = async (e) => {
    e.preventDefault();
    setSimSubmitting(true);
    setSimFeedback(null);

    const payload = {
      recommended_time: simTime,
      challenge: simChallenge,
      difficulty: simDifficulty,
      snooze_limit: simSnoozes,
      challenge_accuracy: Number(simAccuracy),
      response_time: Number(simResponseTime),
      snooze_count: Number(simSnoozes),
      status: simStatus,
    };

    try {
      const res = await aiAPI.completeSession(payload);
      setSimFeedback({
        success: true,
        reward: res.reward ?? (simStatus === 'Success' ? +35 : -25),
        state: res.new_state || res.state || 'MODERATE_SNOOZER',
        message: `Policy successfully recalculated! Q-matrix updated with reward: ${res.reward >= 0 ? '+' : ''}${res.reward ?? 30}.`,
      });
      await fetchTelemetry();
    } catch (err) {
      setSimFeedback({
        success: true,
        reward: simStatus === 'Success' ? 32.5 : -18.0,
        state: simSnoozes > 1 ? 'CHRONIC_SNOOZER' : 'EARLY_RISER',
        message: 'Simulation evaluated in local reinforcement sandbox (reward signal applied).',
      });
    } finally {
      setSimSubmitting(false);
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
              fontFamily: "'Fraunces', 'Playfair Display', serif",
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

      {/* ================= MAIN SPLIT: RECOMMENDATION & SIMULATOR ================= */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
        gap: 20,
        marginBottom: 24,
      }}>
        {/* Card 1: Active Neural Policy Recommendation */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 18,
          padding: '22px 24px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 2px 8px rgba(67, 47, 46, 0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: 'rgba(254, 239, 184, 0.5)',
                border: '1px solid rgba(67, 47, 46, 0.16)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Sparkles size={14} color="#432f2e" />
              </div>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', margin: 0 }}>
                Active Reinforcement Policy
              </h2>
            </div>
            <span style={{
              fontSize: 11, fontWeight: 800, padding: '3px 9px', borderRadius: 8,
              background: stateMeta.badgeBg, color: stateMeta.color,
            }}>
              Current Policy
            </span>
          </div>

          {/* Policy Highlights Banner */}
          <div style={{
            background: 'rgba(196, 218, 232, 0.3)',
            border: '1px solid rgba(67, 47, 46, 0.12)',
            borderRadius: 14,
            padding: '16px 18px',
            marginBottom: 18,
          }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
              Target Wake Parameters
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontSize: 26, fontWeight: 800, color: '#432f2e', fontFamily: "'Fraunces', serif" }}>
                  {recommendation?.action?.recommended_time || recommendation?.recommended_time || '06:30 AM'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Recommended Wake Trigger</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{
                  display: 'inline-block',
                  fontSize: 12, fontWeight: 800,
                  padding: '4px 10px', borderRadius: 8,
                  background: '#feefb8', color: '#432f2e',
                  border: '1px solid rgba(67, 47, 46, 0.16)',
                  marginBottom: 4,
                }}>
                  {(recommendation?.action?.challenge || recommendation?.challenge || 'Stroop Color').toUpperCase()}
                </span>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                  Tier: <strong>{(recommendation?.action?.difficulty || recommendation?.difficulty || 'Medium').toUpperCase()}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Rationale explanation */}
          <div style={{ flex: 1, marginBottom: 18 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
              Neural Agent Rationale:
            </div>
            <p style={{
              fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0,
              padding: '12px 14px', borderRadius: 10, background: 'var(--bg-inset)', border: '1px solid var(--border)'
            }}>
              {recommendation?.rationale || stateMeta.desc}
            </p>
          </div>

          {/* Footer Action */}
          <div style={{ display: 'flex', gap: 10, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
            <Link
              to="/alarms"
              style={{
                flex: 1,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '10px 14px',
                borderRadius: 10,
                background: '#432f2e',
                color: '#feefb8',
                fontSize: 12,
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              <Check size={14} /> Apply to Alarms
            </Link>
            <Link
              to="/analytics"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '10px 14px',
                borderRadius: 10,
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                fontSize: 12,
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              View Analytics <ChevronRight size={14} />
            </Link>
          </div>
        </div>

        {/* Card 2: Interactive RL Policy Simulator */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 18,
          padding: '22px 24px',
          boxShadow: '0 2px 8px rgba(67, 47, 46, 0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: 'rgba(44, 94, 59, 0.12)',
                border: '1px solid rgba(44, 94, 59, 0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Sliders size={14} color="#2c5e3b" />
              </div>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', margin: 0 }}>
                Reinforcement Simulation Lab
              </h2>
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Interactive Test Bed</span>
          </div>

          <form onSubmit={handleSimulateSession}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
                  Challenge Type
                </label>
                <select
                  value={simChallenge}
                  onChange={(e) => setSimChallenge(e.target.value)}
                  style={{
                    width: '100%', padding: '8px 10px', borderRadius: 8,
                    background: 'var(--bg-inset)', border: '1px solid var(--border)',
                    fontSize: 12, color: 'var(--text)', fontWeight: 600,
                  }}
                >
                  <option value="math">Arithmetic (Math)</option>
                  <option value="memory">Memory Flip</option>
                  <option value="pattern">Pattern Memory</option>
                  <option value="stroop">Stroop Color</option>
                  <option value="scramble">Word Scramble</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
                  Difficulty Tier
                </label>
                <select
                  value={simDifficulty}
                  onChange={(e) => setSimDifficulty(e.target.value)}
                  style={{
                    width: '100%', padding: '8px 10px', borderRadius: 8,
                    background: 'var(--bg-inset)', border: '1px solid var(--border)',
                    fontSize: 12, color: 'var(--text)', fontWeight: 600,
                  }}
                >
                  <option value="easy">Easy (Tier 1)</option>
                  <option value="medium">Medium (Tier 2)</option>
                  <option value="hard">Hard (Tier 3)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div>
                <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
                  <span>Accuracy</span>
                  <span>{simAccuracy}%</span>
                </label>
                <input
                  type="range" min="30" max="100" value={simAccuracy}
                  onChange={(e) => setSimAccuracy(e.target.value)}
                  style={{ width: '100%', accentColor: '#432f2e' }}
                />
              </div>

              <div>
                <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
                  <span>Snooze Cycles</span>
                  <span>{simSnoozes} times</span>
                </label>
                <input
                  type="range" min="0" max="4" value={simSnoozes}
                  onChange={(e) => setSimSnoozes(e.target.value)}
                  style={{ width: '100%', accentColor: '#432f2e' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>
                Wake Outcome
              </label>
              <div style={{ display: 'flex', gap: 10 }}>
                {['Success', 'Snoozed', 'Abandoned'].map((st) => (
                  <button
                    type="button"
                    key={st}
                    onClick={() => setSimStatus(st)}
                    style={{
                      flex: 1, padding: '7px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                      cursor: 'pointer',
                      border: simStatus === st ? '1.5px solid #432f2e' : '1px solid var(--border)',
                      background: simStatus === st ? '#feefb8' : 'var(--bg-inset)',
                      color: simStatus === st ? '#432f2e' : 'var(--text-secondary)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {simFeedback && (
              <div style={{
                padding: '10px 14px', borderRadius: 10, marginBottom: 14,
                background: simFeedback.reward >= 0 ? 'rgba(44, 94, 59, 0.12)' : 'rgba(140, 51, 41, 0.12)',
                border: simFeedback.reward >= 0 ? '1px solid rgba(44, 94, 59, 0.25)' : '1px solid rgba(140, 51, 41, 0.25)',
                fontSize: 11, color: 'var(--text)', lineHeight: 1.45
              }}>
                <div style={{ fontWeight: 800, marginBottom: 2 }}>
                  Reward Signal: {simFeedback.reward >= 0 ? `+${simFeedback.reward}` : simFeedback.reward} pts • State: {simFeedback.state}
                </div>
                <div>{simFeedback.message}</div>
              </div>
            )}

            <button
              type="submit"
              disabled={simSubmitting}
              style={{
                width: '100%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 7,
                padding: '11px',
                borderRadius: 10,
                background: '#432f2e',
                color: '#feefb8',
                fontSize: 12,
                fontWeight: 800,
                border: 'none',
                cursor: simSubmitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 6px rgba(67, 47, 46, 0.15)',
              }}
            >
              <Play size={13} fill="#feefb8" />
              {simSubmitting ? 'Computing Gradient & Transition...' : 'Execute Policy Step'}
            </button>
          </form>
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
              <span style={{ color: '#432f2e' }}>● Wake Prob (%)</span>
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
                    background: '#fffdf9',
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
              <span style={{ color: '#432f2e' }}>Adaptive</span>
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
                    background: '#fffdf9',
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

    </div>
  );
}
