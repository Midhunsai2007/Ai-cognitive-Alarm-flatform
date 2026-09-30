'use client';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Bell, Brain, BarChart3, History, Settings, X, Zap } from 'lucide-react';

const NAV = [
  { to: '/',          label: 'Dashboard',  icon: LayoutDashboard, color: '#432f2e' },
  { to: '/alarms',    label: 'Alarms',     icon: Bell,            color: '#5c4342' },
  { to: '/puzzles',   label: 'Puzzle Lab', icon: Brain,           color: '#432f2e' },
  { to: '/analytics', label: 'Analytics',  icon: BarChart3,       color: '#2d4857' },
  { to: '/history',   label: 'History',    icon: History,         color: '#785640' },
  { to: '/settings',  label: 'Settings',   icon: Settings,        color: '#635756' },
];

export function Sidebar({ isOpen, onClose }) {
  const { pathname } = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 30,
            background: 'rgba(67, 47, 46, 0.4)',
            backdropFilter: 'blur(4px)',
          }}
          className="md:hidden"
        />
      )}

      <aside
        style={{
          position: 'fixed',
          top: 0, left: 0, bottom: 0,
          width: 'var(--sidebar-w)',
          background: 'var(--sidebar-bg)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRight: '1px solid var(--sidebar-border)',
          zIndex: 40,
          display: 'flex',
          flexDirection: 'column',
          paddingTop: 62,
          transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className={`hidden md:flex ${isOpen ? '!flex !fixed' : ''}`}
      >
        {/* Close button (mobile) */}
        <button
          onClick={onClose}
          className="md:hidden"
          style={{
            position: 'absolute', top: 16, right: 14,
            background: 'rgba(67, 47, 46, 0.08)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            width: 32, height: 32,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text)',
          }}
        >
          <X size={15} />
        </button>

        {/* Brand (visible when sidebar open on mobile) */}
        <div className="md:hidden" style={{
          position: 'absolute', top: 16, left: 16,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 32, height: 32,
            background: '#432f2e',
            borderRadius: 9,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(67, 47, 46, 0.2)',
          }}>
            <Bell size={14} color="#feefb8" />
          </div>
          <span style={{
            fontFamily: "'Playfair Display', 'Fraunces', serif",
            fontWeight: 700, fontSize: 16,
            color: 'var(--text)',
          }}>CognAlarm</span>
        </div>

        {/* Navigation */}
        <nav style={{ padding: '16px 12px', flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', color: 'var(--text-muted)', padding: '4px 12px 12px', textTransform: 'uppercase' }}>
            Menu
          </div>
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                onClick={onClose}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 14px',
                  borderRadius: 12,
                  fontSize: 13,
                  fontWeight: active ? 800 : 600,
                  color: active ? '#432f2e' : 'var(--text-secondary)',
                  background: active ? '#feefb8' : 'transparent',
                  border: active ? '1px solid rgba(67, 47, 46, 0.16)' : '1px solid transparent',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                  marginBottom: 4,
                  boxShadow: active ? '0 2px 8px rgba(67, 47, 46, 0.08)' : 'none',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={e => {
                  if (!active) {
                    e.currentTarget.style.background = 'rgba(196, 218, 232, 0.35)';
                    e.currentTarget.style.borderColor = 'rgba(67, 47, 46, 0.12)';
                    e.currentTarget.style.color = 'var(--text)';
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                {/* Active left bar */}
                {active && (
                  <div style={{
                    position: 'absolute', left: 0, top: '20%', bottom: '20%',
                    width: 3.5, borderRadius: 2,
                    background: '#432f2e',
                  }} />
                )}
                <div style={{
                  width: 30, height: 30, borderRadius: 8,
                  background: active ? '#ffffff' : 'var(--bg-hover)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s',
                  flexShrink: 0,
                  boxShadow: active ? '0 1px 3px rgba(67, 47, 46, 0.12)' : 'none',
                }}>
                  <Icon size={15} color={active ? '#432f2e' : 'var(--text-muted)'} />
                </div>
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom info card in Powder Blue */}
        <div style={{
          margin: '8px 12px 18px',
          padding: '14px 16px',
          background: 'rgba(196, 218, 232, 0.4)',
          border: '1px solid rgba(67, 47, 46, 0.12)',
          borderRadius: 14,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            marginBottom: 5,
          }}>
            <Zap size={13} color="#432f2e" />
            <span style={{ fontSize: 11, fontWeight: 800, color: '#432f2e', letterSpacing: '0.02em', textTransform: 'uppercase' }}>Adaptive Engine</span>
          </div>
          <div style={{ fontSize: 11, color: '#432f2e', opacity: 0.85, lineHeight: 1.45, fontWeight: 500 }}>
            Cognitive wake telemetry • Dynamic neural challenge scaling
          </div>
        </div>
      </aside>
    </>
  );
}
