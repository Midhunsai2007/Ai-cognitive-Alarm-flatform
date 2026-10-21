'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Brain,
  Zap,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Puzzle,
  CheckCircle2
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg)',
      color: 'var(--text)',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    }}>
      {/* ── HEADER (LOGO + ONLY SIGN IN BUTTON ALONE) ── */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'var(--navbar-bg)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{
          maxWidth: 1040,
          margin: '0 auto',
          padding: '0 24px',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {/* Logo */}
          <div
            onClick={() => router.push('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              cursor: 'pointer',
            }}
          >
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: '#432f2e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(67, 47, 46, 0.18)',
            }}>
              <Brain size={18} color="#feefb8" />
            </div>
            <div>
              <span style={{
                fontFamily: "'Lora', Georgia, 'Times New Roman', serif",
                fontWeight: 700,
                fontSize: 20,
                color: 'var(--text)',
                letterSpacing: '-0.02em',
                lineHeight: 1,
              }}>
                CognAlarm
              </span>
              <span style={{
                display: 'block',
                fontSize: 9,
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--text-muted)',
                marginTop: 2,
              }}>
                Cognitive Wake Platform
              </span>
            </div>
          </div>

          {/* Top Right: ONLY Sign In Button Alone */}
          <button
            id="header-sign-in-btn"
            onClick={() => router.push('/login')}
            style={{
              padding: '9px 22px',
              borderRadius: 12,
              border: 'none',
              background: '#432f2e',
              color: '#feefb8',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 4px 14px rgba(67, 47, 46, 0.16)',
              transition: 'transform 0.15s ease, background 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.background = '#583e3d'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.background = '#432f2e'; }}
          >
            <span>Sign In</span>
            <ArrowRight size={15} color="#feefb8" />
          </button>
        </div>
      </header>

      {/* ── VERY SIMPLE, CLEAN CONTENT ── */}
      <main style={{
        flex: 1,
        maxWidth: 980,
        margin: '0 auto',
        padding: '52px 24px 44px',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        
        {/* Hero Section */}
        <section style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 48px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            padding: '5px 14px',
            borderRadius: 20,
            background: 'var(--bg-hover)',
            border: '1px solid var(--border-strong)',
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--text)',
            marginBottom: 20,
          }}>
            <Sparkles size={14} color="#432f2e" />
            <span>AI-Powered Cognitive Wake-Up System</span>
          </div>

          <h1 style={{
            fontFamily: "'Lora', Georgia, 'Times New Roman', serif",
            fontSize: 'clamp(32px, 4.5vw, 46px)',
            fontWeight: 700,
            lineHeight: 1.18,
            letterSpacing: '-0.02em',
            color: 'var(--text)',
            marginBottom: 16,
          }}>
            Wake Up Your Mind, <br />
            <span style={{
              background: 'linear-gradient(135deg, #432f2e 0%, #7c5856 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textDecoration: 'underline',
              textDecorationColor: '#feefb8',
              textUnderlineOffset: '8px',
            }}>
              Not Just Your Body.
            </span>
          </h1>

          <p style={{
            fontSize: 'clamp(15px, 1.8vw, 17px)',
            lineHeight: 1.6,
            color: 'var(--text-secondary)',
            marginBottom: 28,
            maxWidth: 620,
            margin: '0 auto 28px',
          }}>
            CognAlarm eliminates morning grogginess and chronic snoozing. To dismiss your alarm, you must solve a quick
            cognitive puzzle—stimulating your brain so you wake up fully alert and ready for the day.
          </p>

          {/* Primary Action Button */}
          <div>
            <button
              id="hero-sign-in-btn"
              onClick={() => router.push('/login')}
              style={{
                padding: '13px 32px',
                borderRadius: 14,
                border: 'none',
                background: '#432f2e',
                color: '#feefb8',
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 6px 20px rgba(67, 47, 46, 0.2)',
                transition: 'transform 0.15s ease, background 0.15s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.background = '#583e3d'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.background = '#432f2e'; }}
            >
              <span>Sign In</span>
              <ArrowRight size={16} color="#feefb8" />
            </button>
          </div>
        </section>

        {/* 3 Simple Feature Cards */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 18,
          marginBottom: 36,
        }}>
          {/* Card 1 */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: '22px 20px',
            boxShadow: '0 4px 14px rgba(67, 47, 46, 0.04)',
          }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: '#432f2e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
            }}>
              <Brain size={18} color="#feefb8" />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
              Cognitive Puzzles
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              Solve quick math, memory cards, or reaction challenges to stop the alarm and shake off sleep inertia.
            </p>
          </div>

          {/* Card 2 */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: '22px 20px',
            boxShadow: '0 4px 14px rgba(67, 47, 46, 0.04)',
          }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: '#432f2e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
            }}>
              <Zap size={18} color="#feefb8" />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
              Adaptive Intelligence
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              AI analyzes your wake patterns and response times to automatically tune puzzle difficulty for optimal alertness.
            </p>
          </div>

          {/* Card 3 */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: '22px 20px',
            boxShadow: '0 4px 14px rgba(67, 47, 46, 0.04)',
          }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: '#432f2e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
            }}>
              <TrendingUp size={18} color="#feefb8" />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
              Habit & Streak Tracking
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              Track waking consistency, minimize snoozes, and build lasting morning focus with personal analytics.
            </p>
          </div>
        </section>

        {/* 3-Step Simple Routine */}
        <section style={{
          background: 'var(--bg-hover)',
          borderRadius: 16,
          border: '1px solid var(--border)',
          padding: '20px 24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-around',
          gap: 16,
          textAlign: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#432f2e', color: '#feefb8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800 }}>1</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Set Alarm Time</span>
          </div>
          <span style={{ color: 'var(--text-muted)' }}>➔</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#432f2e', color: '#feefb8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800 }}>2</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Solve Puzzle to Dismiss</span>
          </div>
          <span style={{ color: 'var(--text-muted)' }}>➔</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#432f2e', color: '#feefb8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800 }}>3</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Wake Up Mentally Alert</span>
          </div>
        </section>

      </main>

      {/* ── MINIMAL FOOTER ── */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '18px 24px',
        background: 'var(--bg-card)',
        textAlign: 'center',
        fontSize: 12,
        color: 'var(--text-muted)',
      }}>
        <div style={{ maxWidth: 980, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div><strong>CognAlarm</strong> • AI Cognitive Wake Platform</div>
          <div>© {new Date().getFullYear()} CognAlarm. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
