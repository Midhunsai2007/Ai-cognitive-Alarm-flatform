import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, CheckCircle2 } from 'lucide-react';

export function PatternMemoryPuzzle({ difficulty = 'medium', onSuccess, onFail }) {
  const gridCount = 9; // 3x3 grid
  const sequenceLength = difficulty === 'easy' ? 3 : difficulty === 'hard' ? 5 : 4;
  
  const [sequence, setSequence] = useState([]);
  const [userStep, setUserStep] = useState(0);
  const [activeTile, setActiveTile] = useState(null);
  const [isPlayingSequence, setIsPlayingSequence] = useState(true);
  const [message, setMessage] = useState('Watch the pattern sequence...');
  const [errorTile, setErrorTile] = useState(null);

  const startPattern = () => {
    const newSeq = [];
    for (let i = 0; i < sequenceLength; i++) {
      newSeq.push(Math.floor(Math.random() * gridCount));
    }
    setSequence(newSeq);
    setUserStep(0);
    setIsPlayingSequence(true);
    setMessage('Watch the pattern sequence...');
    setErrorTile(null);

    let idx = 0;
    const interval = setInterval(() => {
      if (idx < newSeq.length) {
        setActiveTile(newSeq[idx]);
        setTimeout(() => setActiveTile(null), 400);
        idx++;
      } else {
        clearInterval(interval);
        setIsPlayingSequence(false);
        setMessage('Your turn! Replay the pattern sequence.');
      }
    }, 650);
  };

  useEffect(() => {
    startPattern();
  }, [difficulty]);

  const handleTileClick = (index) => {
    if (isPlayingSequence) return;

    if (sequence[userStep] === index) {
      setActiveTile(index);
      setTimeout(() => setActiveTile(null), 250);

      const nextStep = userStep + 1;
      setUserStep(nextStep);

      if (nextStep === sequence.length) {
        setMessage('Pattern Mastered! Verifying...');
        setTimeout(() => {
          onSuccess();
        }, 400);
      }
    } else {
      setErrorTile(index);
      setMessage('Wrong tile! Flashing sequence again...');
      setTimeout(() => {
        setErrorTile(null);
        startPattern();
      }, 1000);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, width: '100%', maxWidth: 360, margin: '0 auto' }}>
      <div style={{ textAlign: 'center' }}>
        <span style={{
          fontSize: 11, fontWeight: 700,
          padding: '3px 10px', borderRadius: 20,
          background: 'rgba(167,139,250,0.12)', color: '#a78bfa',
          border: '1px solid rgba(167,139,250,0.25)',
          textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>
          Pattern Memory • {difficulty}
        </span>
        <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700, color: 'var(--text)', marginTop: 8 }}>
          Repeat the Sequence
        </h3>
        <p style={{ fontSize: 12, color: 'var(--accent-light)', fontWeight: 600, marginTop: 4 }}>{message}</p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 10,
        background: 'var(--bg-surface)',
        padding: 16,
        borderRadius: 18,
        border: '1px solid var(--border-strong)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
      }}>
        {Array.from({ length: gridCount }).map((_, i) => {
          const isActive = activeTile === i;
          const isError = errorTile === i;
          return (
            <button
              key={i}
              type="button"
              onClick={() => handleTileClick(i)}
              disabled={isPlayingSequence}
              style={{
                width: 76, height: 76,
                borderRadius: 14,
                border: isActive ? '2px solid #fff' : isError ? '2px solid var(--danger)' : '1px solid var(--border)',
                background: isActive
                  ? '#432f2e'
                  : isError
                  ? 'var(--danger)'
                  : 'var(--bg-card)',
                boxShadow: isActive ? '0 4px 16px rgba(67,47,46,0.3)' : isError ? '0 4px 16px rgba(158,56,52,0.3)' : 'none',
                cursor: isPlayingSequence ? 'not-allowed' : 'pointer',
                transform: isActive ? 'scale(1.06)' : 'none',
                transition: 'all 0.15s ease',
              }}
            />
          );
        })}
      </div>

      <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
        Step: {userStep} / {sequenceLength}
      </div>
    </div>
  );
}
