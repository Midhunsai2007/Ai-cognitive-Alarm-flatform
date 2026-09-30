import React, { useState, useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';

const WORDS_POOL = [
  { word: 'COGNITIVE', hint: 'Mental action of acquiring knowledge' },
  { word: 'AWAKENING', hint: 'Act of waking up from sleep' },
  { word: 'FOCUS', hint: 'State of concentrated attention' },
  { word: 'SYNAPSE', hint: 'Junction between brain nerve cells' },
  { word: 'ENERGY', hint: 'Capacity to perform mental work' },
  { word: 'NEURON', hint: 'Specialized nerve transmission cell' },
  { word: 'MEMORY', hint: 'Retention of mental data over time' },
  { word: 'ALERT', hint: 'State of being vigilant and ready' },
];

export function WordScramblePuzzle({ difficulty = 'medium', onSuccess, onFail }) {
  const [targetObj, setTargetObj] = useState(WORDS_POOL[0]);
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
    const chosen = WORDS_POOL[Math.floor(Math.random() * WORDS_POOL.length)];
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
        <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700, color: 'var(--text)', marginTop: 8 }}>
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
          fontFamily: "'Space Grotesk', sans-serif",
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
            fontFamily: "'Space Grotesk', sans-serif",
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
