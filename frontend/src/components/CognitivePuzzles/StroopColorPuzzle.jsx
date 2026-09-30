import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const COLORS = [
  { name: 'Red', hex: '#ef4444' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Green', hex: '#22c55e' },
  { name: 'Yellow', hex: '#eab308' },
  { name: 'Purple', hex: '#a855f7' },
];

export function StroopColorPuzzle({ difficulty = 'medium', onSuccess, onFail }) {
  const targetRounds = difficulty === 'easy' ? 2 : difficulty === 'hard' ? 4 : 3;
  const [currentRound, setCurrentRound] = useState(1);
  const [targetWord, setTargetWord] = useState(COLORS[0]);
  const [textColor, setTextColor] = useState(COLORS[1]);
  const [questionType, setQuestionType] = useState('color'); // 'color' or 'meaning'
  const [selectedColor, setSelectedColor] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const nextChallenge = () => {
    const wordObj = COLORS[Math.floor(Math.random() * COLORS.length)];
    let colorObj = COLORS[Math.floor(Math.random() * COLORS.length)];
    while (colorObj.name === wordObj.name) {
      colorObj = COLORS[Math.floor(Math.random() * COLORS.length)];
    }

    const type = Math.random() > 0.5 ? 'color' : 'meaning';
    setTargetWord(wordObj);
    setTextColor(colorObj);
    setQuestionType(type);
    setSelectedColor('');
    setErrorMsg('');
  };

  useEffect(() => {
    nextChallenge();
  }, [difficulty]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedColor) {
      setErrorMsg('Please select a color option first!');
      return;
    }

    const correctAnswer = questionType === 'color' ? textColor.name : targetWord.name;

    if (selectedColor === correctAnswer) {
      if (currentRound >= targetRounds) {
        onSuccess();
      } else {
        setCurrentRound(prev => prev + 1);
        nextChallenge();
      }
    } else {
      setErrorMsg('Incorrect selection! Pay attention to the prompt!');
      setSelectedColor('');
      setTimeout(() => setErrorMsg(''), 1200);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, width: '100%', maxWidth: 380, margin: '0 auto' }}>
      <div style={{ textAlign: 'center' }}>
        <span style={{
          fontSize: 11, fontWeight: 700,
          padding: '3px 10px', borderRadius: 20,
          background: 'rgba(245,158,11,0.12)', color: '#f59e0b',
          border: '1px solid rgba(245,158,11,0.25)',
          textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>
          Stroop Test • {difficulty} • Round {currentRound}/{targetRounds}
        </span>
        <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 700, color: 'var(--text)', marginTop: 8 }}>
          {questionType === 'color' ? 'Select the INK COLOR of the word!' : 'Select the WORD VALUE (text meaning)!'}
        </h3>
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
        <span
          style={{
            fontSize: 40,
            fontWeight: 900,
            fontFamily: "'Space Grotesk', sans-serif",
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: textColor.hex,
            textShadow: `0 0 20px ${textColor.hex}50`,
          }}
        >
          {targetWord.name}
        </span>
      </div>

      {errorMsg && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--danger)', fontWeight: 600 }}>
          <AlertCircle size={14} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Color Selection Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, width: '100%' }}>
        {COLORS.map((c) => {
          const isSelected = selectedColor === c.name;
          return (
            <button
              key={c.name}
              type="button"
              onClick={() => { setSelectedColor(c.name); setErrorMsg(''); }}
              style={{
                padding: '10px 8px',
                borderRadius: 10,
                border: isSelected ? `2px solid ${c.hex}` : '1px solid var(--border)',
                background: isSelected ? `${c.hex}20` : 'var(--bg-surface)',
                color: isSelected ? c.hex : 'var(--text-secondary)',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s',
                boxShadow: isSelected ? `0 0 14px ${c.hex}40` : 'none',
              }}
            >
              {c.name}
            </button>
          );
        })}
      </div>

      {/* Submit Button */}
      <button
        type="button"
        onClick={handleSubmit}
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
    </div>
  );
}
