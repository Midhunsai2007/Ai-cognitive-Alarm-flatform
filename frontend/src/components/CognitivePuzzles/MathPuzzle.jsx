import React, { useState, useEffect } from 'react';
import { CheckCircle2, RefreshCw } from 'lucide-react';

export function MathPuzzle({ difficulty = 'medium', onSuccess, onFail }) {
  const [problem, setProblem] = useState({ question: '', answer: 0 });
  const [userAnswer, setUserAnswer] = useState('');
  const [error, setError] = useState(false);

  const generateProblem = () => {
    let q = '', a = 0;
    if (difficulty === 'easy') {
      const num1 = Math.floor(Math.random() * 20) + 5;
      const num2 = Math.floor(Math.random() * 20) + 5;
      q = `${num1} + ${num2}`;
      a = num1 + num2;
    } else if (difficulty === 'hard') {
      const num1 = Math.floor(Math.random() * 25) + 8;
      const num2 = Math.floor(Math.random() * 8) + 2;
      const num3 = Math.floor(Math.random() * 15) + 5;
      q = `(${num1} × ${num2}) + ${num3}`;
      a = (num1 * num2) + num3;
    } else { // medium
      const num1 = Math.floor(Math.random() * 25) + 10;
      const num2 = Math.floor(Math.random() * 25) + 10;
      const ops = ['+', '-'];
      const op = ops[Math.floor(Math.random() * ops.length)];
      if (op === '+') {
        q = `${num1} + ${num2}`;
        a = num1 + num2;
      } else {
        const big = Math.max(num1, num2);
        const small = Math.min(num1, num2);
        q = `${big} - ${small}`;
        a = big - small;
      }
    }
    setProblem({ question: q, answer: a });
    setUserAnswer('');
    setError(false);
  };

  useEffect(() => {
    generateProblem();
  }, [difficulty]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userAnswer.trim()) return;
    if (parseInt(userAnswer.trim(), 10) === problem.answer) {
      onSuccess();
    } else {
      setError(true);
      setUserAnswer('');
      setTimeout(() => setError(false), 1000);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, width: '100%', maxWidth: 380, margin: '0 auto' }}>
      <div style={{ textAlign: 'center' }}>
        <span style={{
          fontSize: 11, fontWeight: 700,
          padding: '3px 10px', borderRadius: 20,
          background: 'rgba(96,165,250,0.12)', color: '#60a5fa',
          border: '1px solid rgba(96,165,250,0.25)',
          textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>
          Math Challenge • {difficulty}
        </span>
        <h3 style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: 18, fontWeight: 700, color: 'var(--text)', marginTop: 8 }}>
          Solve the Equation
        </h3>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Enter the exact result to verify mental alertness.</p>
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
          fontSize: 34, fontWeight: 800,
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          color: 'var(--accent-light)',
          letterSpacing: '0.04em',
        }}>
          {problem.question} = ?
        </span>
      </div>

      <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <input
          type="number"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Type your answer..."
          autoFocus
          required
          style={{
            width: '100%',
            padding: '14px 18px',
            background: 'var(--bg-surface)',
            border: error ? '1px solid var(--danger)' : '1px solid var(--border-strong)',
            borderRadius: 12,
            fontSize: 22,
            fontWeight: 700,
            textAlign: 'center',
            color: 'var(--text)',
            outline: 'none',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            transition: 'all 0.2s',
          }}
          onFocus={e => { if (!error) e.target.style.borderColor = 'var(--accent-mid)'; }}
          onBlur={e => { if (!error) e.target.style.borderColor = 'var(--border-strong)'; }}
        />

        {error && (
          <p style={{ fontSize: 12, color: 'var(--danger)', fontWeight: 600, textAlign: 'center' }}>
            Incorrect answer! Try again.
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
