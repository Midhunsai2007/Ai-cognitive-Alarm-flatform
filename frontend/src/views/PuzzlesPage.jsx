import React, { useState } from 'react';
import { MathPuzzle } from '../components/CognitivePuzzles/MathPuzzle';
import { PatternMemoryPuzzle } from '../components/CognitivePuzzles/PatternMemoryPuzzle';
import { MemoryFlipPuzzle } from '../components/CognitivePuzzles/MemoryFlipPuzzle';
import { StroopColorPuzzle } from '../components/CognitivePuzzles/StroopColorPuzzle';
import { WordScramblePuzzle } from '../components/CognitivePuzzles/WordScramblePuzzle';
import { Brain, CheckCircle2, RefreshCw, Sparkles, Award } from 'lucide-react';

const PUZZLES = [
  { id: 'math',    label: 'Math',           icon: '🧮', component: MathPuzzle },
  { id: 'pattern', label: 'Pattern Memory', icon: '🔢', component: PatternMemoryPuzzle },
  { id: 'memory',  label: 'Memory Flip',    icon: '🃏', component: MemoryFlipPuzzle },
  { id: 'stroop',  label: 'Stroop Color',   icon: '🎨', component: StroopColorPuzzle },
  { id: 'word',    label: 'Word Scramble',  icon: '📝', component: WordScramblePuzzle },
];

const DIFFICULTIES = [
  { id: 'easy',   label: 'Easy' },
  { id: 'medium', label: 'Medium' },
  { id: 'hard',   label: 'Hard' },
];

export default function PuzzlesPage() {
  const [activePuzzle, setActivePuzzle] = useState('math');
  const [difficulty, setDifficulty] = useState('medium');
  const [result, setResult] = useState(null);
  const [key, setKey] = useState(0);

  const ActiveComponent = PUZZLES.find(p => p.id === activePuzzle)?.component || MathPuzzle;
  const activePuzzleObj = PUZZLES.find(p => p.id === activePuzzle);
  const reset = () => { setResult(null); setKey(k => k + 1); };

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '28px 24px' }} className="fade-in">
      <div style={{ marginBottom: 26 }}>
        <h1 style={{
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          fontSize: 24, fontWeight: 800,
          color: 'var(--text)', marginBottom: 5,
        }}>
          🧠 Puzzle Practice Lab
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Sharpen your cognitive response time and mental agility.
        </p>
      </div>

      {/* Controls */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center',
      }}>
        {/* Puzzle types */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {PUZZLES.map(p => (
            <button
              key={p.id}
              onClick={() => { setActivePuzzle(p.id); reset(); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700,
                border: activePuzzle === p.id ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                cursor: 'pointer', transition: 'all 0.15s',
                background: activePuzzle === p.id ? 'var(--accent)' : 'var(--bg-card)',
                color: activePuzzle === p.id ? 'var(--accent-contrast)' : 'var(--text-secondary)',
                boxShadow: activePuzzle === p.id ? '0 2px 14px var(--accent-glow)' : 'none',
              }}
            >
              <span>{p.icon}</span>
              <span>{p.label}</span>
            </button>
          ))}
        </div>

        {/* Difficulty pills */}
        <div style={{ display: 'flex', gap: 6 }}>
          {DIFFICULTIES.map(d => {
            const isSel = difficulty === d.id;
            return (
              <button
                key={d.id}
                onClick={() => { setDifficulty(d.id); reset(); }}
                style={{
                  padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                  border: isSel ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                  cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.15s',
                  background: isSel ? 'var(--accent)' : 'var(--bg-card)',
                  color: isSel ? 'var(--accent-contrast)' : 'var(--text-secondary)',
                  boxShadow: isSel ? '0 2px 8px var(--accent-glow)' : 'none',
                }}
              >
                {d.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main puzzle container */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 20,
        boxShadow: '0 16px 48px rgba(0,0,0,0.2)',
        overflow: 'hidden',
      }}>
        {/* Container header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 22px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-surface)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>{activePuzzleObj?.icon}</span>
            <span style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>
              {activePuzzleObj?.label} Challenge
            </span>
          </div>
          <span style={{
            fontSize: 11, fontWeight: 700,
            padding: '3px 10px', borderRadius: 20,
            textTransform: 'capitalize',
            background: DIFFICULTIES.find(d => d.id === difficulty)?.bg,
            color: DIFFICULTIES.find(d => d.id === difficulty)?.color,
            border: `1px solid ${DIFFICULTIES.find(d => d.id === difficulty)?.border}`,
          }}>
            {difficulty}
          </span>
        </div>

        {result === 'success' ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 24px', gap: 14 }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 24px rgba(16, 185, 129, 0.4)',
            }}>
              <CheckCircle2 size={36} color="#432f2e" />
            </div>
            <h2 style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: 22, fontWeight: 800, color: 'var(--text)' }}>Challenge Solved!</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', maxWidth: 360 }}>
              Great cognitive performance! Regular challenge solving sharpens neuro-plasticity and morning alertness.
            </p>
            <button className="btn-primary" onClick={reset} style={{ marginTop: 10 }}>
              <RefreshCw size={14} /> Try Another Challenge
            </button>
          </div>
        ) : (
          <div style={{ padding: '24px' }}>
            <ActiveComponent
              key={key}
              difficulty={difficulty}
              onSuccess={() => setResult('success')}
              onFail={() => reset()}
            />
          </div>
        )}
      </div>
    </div>
  );
}
