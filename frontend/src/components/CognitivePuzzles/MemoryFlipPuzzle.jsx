import React, { useState, useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';

const EMOJI_POOL = ['🧠', '⚡', '🔥', '🚀', '⭐', '💎', '🎯', '🎨'];

export function MemoryFlipPuzzle({ difficulty = 'medium', onSuccess, onFail }) {
  const pairCount = difficulty === 'easy' ? 3 : difficulty === 'hard' ? 6 : 4;
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [disabled, setDisabled] = useState(false);

  const initGame = () => {
    const selectedEmojis = EMOJI_POOL.slice(0, pairCount);
    const deck = [...selectedEmojis, ...selectedEmojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, idx) => ({ id: idx, emoji }));

    setCards(deck);
    setFlipped([]);
    setMatched([]);
    setDisabled(false);
  };

  useEffect(() => {
    initGame();
  }, [difficulty]);

  const handleCardClick = (index) => {
    if (disabled || flipped.includes(index) || matched.includes(index)) return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setDisabled(true);
      const [firstIdx, secondIdx] = newFlipped;
      if (cards[firstIdx].emoji === cards[secondIdx].emoji) {
        const newMatched = [...matched, firstIdx, secondIdx];
        setMatched(newMatched);
        setFlipped([]);
        setDisabled(false);

        if (newMatched.length === cards.length) {
          setTimeout(() => onSuccess(), 400);
        }
      } else {
        setTimeout(() => {
          setFlipped([]);
          setDisabled(false);
        }, 700);
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, width: '100%', maxWidth: 360, margin: '0 auto' }}>
      <div style={{ textAlign: 'center' }}>
        <span style={{
          fontSize: 11, fontWeight: 700,
          padding: '3px 10px', borderRadius: 20,
          background: 'rgba(236,72,153,0.12)', color: '#ec4899',
          border: '1px solid rgba(236,72,153,0.25)',
          textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>
          Memory Flip • {difficulty}
        </span>
        <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700, color: 'var(--text)', marginTop: 8 }}>
          Match the Pairs
        </h3>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Match all hidden pairs to solve the challenge.</p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: pairCount <= 4 ? 'repeat(4, 1fr)' : 'repeat(4, 1fr)',
        gap: 8,
        width: '100%',
      }}>
        {cards.map((card, i) => {
          const isFlipped = flipped.includes(i) || matched.includes(i);
          return (
            <button
              key={i}
              type="button"
              onClick={() => handleCardClick(i)}
              style={{
                height: 70,
                borderRadius: 12,
                fontSize: 26,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isFlipped ? 'var(--bg-surface)' : 'var(--bg-card)',
                border: isFlipped ? '2px solid var(--accent-mid)' : '1px solid var(--border)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: isFlipped ? '0 0 16px var(--accent-glow)' : 'none',
              }}
            >
              {isFlipped ? card.emoji : '❓'}
            </button>
          );
        })}
      </div>

      <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
        Matched: {matched.length / 2} / {pairCount} pairs
      </div>
    </div>
  );
}
