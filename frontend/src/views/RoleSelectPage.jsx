import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Shield, Heart, ArrowRight, Brain, Zap, Users } from 'lucide-react';

const PORTALS = [
  {
    role: 'user',
    label: 'User Portal',
    desc: 'Access your cognitive alarms, puzzles, and personal analytics.',
    icon: Bell,
    color: '#432f2e',
    glow: 'rgba(67,47,46,0.15)',
    bg: 'rgba(67,47,46,0.06)',
    border: 'rgba(67,47,46,0.2)',
    features: ['Smart Alarms', 'Cognitive Puzzles', 'Personal Analytics', 'Wake History'],
    path: '/auth',
    emoji: '⏰',
  },
  {
    role: 'coach',
    label: 'Wellness Coach',
    desc: 'Monitor user behaviour, habit adherence, sleep trends and progress.',
    icon: Heart,
    color: '#2c5e3b',
    glow: 'rgba(44,94,59,0.15)',
    bg: 'rgba(44,94,59,0.08)',
    border: 'rgba(44,94,59,0.22)',
    features: ['User Behavior Insights', 'Habit Adherence Analytics', 'Sleep Trend Reports', 'Progress Monitoring'],
    path: '/coach/login',
    emoji: '🌿',
  },
  {
    role: 'admin',
    label: 'Admin Portal',
    desc: 'Manage users, platform analytics, recommendations and system reports.',
    icon: Shield,
    color: '#a66820',
    glow: 'rgba(166,104,32,0.15)',
    bg: 'rgba(166,104,32,0.08)',
    border: 'rgba(166,104,32,0.22)',
    features: ['User Management', 'Platform Analytics', 'Recommendation Monitoring', 'System Reports'],
    path: '/admin/login',
    emoji: '🛡️',
  },
];

export default function RoleSelectPage() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Ambient warm cream blobs (no neon) */}
      <div style={{ position: 'absolute', top: '-15%', left: '-10%', width: '45vw', height: '45vw', background: 'radial-gradient(ellipse, rgba(254,239,184,0.3) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-15%', right: '-10%', width: '40vw', height: '40vw', background: 'radial-gradient(ellipse, rgba(196,218,232,0.3) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 52, position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{
            width: 52, height: 52,
            background: '#432f2e',
            borderRadius: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(67,47,46,0.2)',
            animation: 'float 4s ease-in-out infinite',
          }}>
            <Brain size={24} color="#feefb8" />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 800, fontSize: 28,
              color: '#432f2e',
              lineHeight: 1,
            }}>CognAlarm</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>Intelligent Cognitive Wake Platform</div>
          </div>
        </div>

        <h1 style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 36, fontWeight: 800,
          color: 'var(--text)', marginBottom: 10,
          lineHeight: 1.2,
        }}>
          Choose Your Portal
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-muted)', maxWidth: 480, margin: '0 auto' }}>
          Select the role that matches your access level to enter the platform.
        </p>
      </div>

      {/* Portal cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
        gap: 20,
        maxWidth: 980,
        width: '100%',
        position: 'relative',
        zIndex: 1,
      }}>
        {PORTALS.map((portal, i) => {
          const Icon = portal.icon;
          return (
            <div
              key={portal.role}
              onClick={() => navigate(portal.path)}
              style={{
                background: 'var(--bg-card)',
                border: `1px solid ${portal.border}`,
                borderRadius: 20,
                padding: '28px 24px',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                position: 'relative',
                overflow: 'hidden',
                animation: `slideUp 0.4s ease ${i * 0.1}s both`,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = `0 20px 60px ${portal.glow}`;
                e.currentTarget.style.borderColor = portal.color + '60';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = portal.border;
              }}
            >
              {/* Top glow accent */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                background: `linear-gradient(90deg, transparent, ${portal.color}, transparent)`,
                opacity: 0.7,
              }} />

              {/* Corner glow */}
              <div style={{
                position: 'absolute', top: -20, right: -20,
                width: 100, height: 100,
                background: `radial-gradient(circle, ${portal.color}18 0%, transparent 70%)`,
                borderRadius: '50%',
                pointerEvents: 'none',
              }} />

              {/* Icon */}
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: portal.bg,
                border: `1px solid ${portal.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 18,
                boxShadow: `0 0 20px ${portal.glow}`,
              }}>
                <Icon size={24} color={portal.color} />
              </div>

              {/* Emoji label */}
              <div style={{ fontSize: 13, fontWeight: 700, color: portal.color, marginBottom: 6, letterSpacing: '0.02em' }}>
                {portal.emoji} {portal.label}
              </div>

              <h2 style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 20, fontWeight: 700,
                color: 'var(--text)', marginBottom: 10, lineHeight: 1.3,
              }}>
                {portal.label === 'User Portal' ? 'My Alarm Dashboard' : portal.label === 'Wellness Coach' ? 'Coach Dashboard' : 'Admin Dashboard'}
              </h2>

              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 20 }}>
                {portal.desc}
              </p>

              {/* Feature list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 24 }}>
                {portal.features.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: portal.color, flexShrink: 0 }} />
                    {f}
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button style={{
                width: '100%',
                padding: '11px 16px',
                background: `linear-gradient(135deg, ${portal.color}, ${portal.color}bb)`,
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 700,
                fontFamily: "'Space Grotesk', sans-serif",
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all 0.15s',
                boxShadow: `0 4px 20px ${portal.glow}`,
              }}>
                Enter Portal <ArrowRight size={15} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ marginTop: 48, textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 4 }}>
          <Zap size={11} color="var(--accent-light)" />
          <span>Powered by Scikit-learn AI · MongoDB Persistence</span>
        </div>
        <span>CognAlarm v2.1 — Cognitive Wake Platform</span>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
