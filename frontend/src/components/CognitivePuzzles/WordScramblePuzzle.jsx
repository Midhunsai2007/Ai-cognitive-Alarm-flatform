import React, { useState, useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';

const WORDS_BY_DIFFICULTY = {
  beginner: [
    { word: 'WAKE', hint: 'Emerge from sleep' },
    { word: 'MIND', hint: 'Element of person that enables awareness' },
    { word: 'CALM', hint: 'Tranquil morning state' },
    { word: 'DAWN', hint: 'The first appearance of light in morning' },
    { word: 'RISE', hint: 'Get up from sleep or bed' },
  ],
  easy: [
    { word: 'FOCUS', hint: 'State of concentrated attention' },
    { word: 'ALERT', hint: 'State of being vigilant and ready' },
    { word: 'BRAIN', hint: 'Central organ of nervous system' },
    { word: 'SMART', hint: 'Quick-witted mental intelligence' },
    { word: 'CLEAR', hint: 'Free from morning cloudiness' },
  ],
  medium: [
    { word: 'SYNAPSE', hint: 'Junction between brain nerve cells' },
    { word: 'NEURON', hint: 'Specialized nerve transmission cell' },
    { word: 'MEMORY', hint: 'Retention of mental data over time' },
    { word: 'ENERGY', hint: 'Capacity to perform mental work' },
    { word: 'SIGNAL', hint: 'Electrical impulse in nerve fibers' },
  ],
  hard: [
    { word: 'COGNITIVE', hint: 'Mental action of acquiring knowledge' },
    { word: 'AWAKENING', hint: 'Act of waking up into alertness' },
    { word: 'ATTENTION', hint: 'Notice taken of stimulus' },
    { word: 'ENDURANCE', hint: 'Ability to sustain high focus' },
  ],
  expert: [
    { word: 'NEUROPLASTICITY', hint: 'Brains ability to rewire and adapt' },
    { word: 'CONSCIOUSNESS', hint: 'State of being aware of surroundings' },
    { word: 'CHRONOBIOLOGY', hint: 'Study of biological circadian rhythms' },
    { word: 'COMPREHENSION', hint: 'Action of capability of understanding' },
  ],
};

export function WordScramblePuzzle({ difficulty = 'medium', onSuccess, onFail }) {
  const diffKey = (difficulty || 'medium').toLowerCase();
  const pool = WORDS_BY_DIFFICULTY[diffKey] || WORDS_BY_DIFFICULTY.medium;
  const [targetObj, setTargetObj] = useState(pool[0]);
  const [scrambled, setScrambled] = useState('');
  const [userInput, setUserInput] = useState('');
  const [error, setError] = useState(false);

  const scrambleWord = (wordStr) => {
    const arr = wordStr.split('');
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    const res = arr.join('');
    return res === wordStr ? scrambleWord(wordStr) : res;
  };

  const newGame = () => {
    const activePool = WORDS_BY_DIFFICULTY[(difficulty || 'medium').toLowerCase()] || WORDS_BY_DIFFICULTY.medium;
    const chosen = activePool[Math.floor(Math.random() * activePool.length)];
    setTargetObj(chosen);
    setScrambled(scrambleWord(chosen.word));
    setUserInput('');
    setError(false);
  };

  useEffect(() => {
    newGame();
  }, [difficulty]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    if (userInput.trim().toUpperCase() === targetObj.word) {
      onSuccess();
    } else {
      setError(true);
      setUserInput('');
      setTimeout(() => setError(false), 1000);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, width: '100%', maxWidth: 380, margin: '0 auto' }}>
      <div style={{ textAlign: 'center' }}>
        <span style={{
          fontSize: 11, fontWeight: 700,
          padding: '3px 10px', borderRadius: 20,
          background: 'rgba(6,182,212,0.12)', color: '#06b6d4',
          border: '1px solid rgba(6,182,212,0.25)',
          textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>
          Word Challenge • {difficulty}
        </span>
        <h3 style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: 18, fontWeight: 700, color: 'var(--text)', marginTop: 8 }}>
          Unscramble the Word
        </h3>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Hint: {targetObj.hint}</p>
      </div>

      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-strong)',
        borderRadius: 16,
        padding: '24px 20px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
      }}>
        <span style={{
          fontSize: 32, fontWeight: 800,
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          color: '#06b6d4',
          letterSpacing: '0.2em',
        }}>
          {scrambled}
        </span>
      </div>

      <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="TYPE UNSCRAMBLED WORD..."
          autoFocus
          required
          style={{
            width: '100%',
            padding: '14px 18px',
            background: 'var(--bg-surface)',
            border: error ? '1px solid var(--danger)' : '1px solid var(--border-strong)',
            borderRadius: 12,
            fontSize: 18,
            fontWeight: 700,
            textAlign: 'center',
            textTransform: 'uppercase',
            color: 'var(--text)',
            outline: 'none',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            letterSpacing: '0.08em',
            transition: 'all 0.2s',
          }}
          onFocus={e => { if (!error) e.target.style.borderColor = 'var(--accent-mid)'; }}
          onBlur={e => { if (!error) e.target.style.borderColor = 'var(--border-strong)'; }}
        />

        {error && (
          <p style={{ fontSize: 12, color: 'var(--danger)', fontWeight: 600, textAlign: 'center' }}>
            Incorrect word! Try again.
          </p>
        )}

        <button
          type="submit"
          className="btn-primary"
          style={{
            width: '100%',
            padding: '14px 20px',
            fontSize: 15,
            fontWeight: 700,
            borderRadius: 12,
            justifyContent: 'center',
          }}
        >
          <CheckCircle2 size={18} />
          <span>Submit Answer</span>
        </button>
      </form>
    </div>
  );
}
