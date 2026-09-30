'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';
import { Bell, Sun, Moon, Menu, ChevronDown, LogOut, Settings, Flame } from 'lucide-react';

export function Navbar({ onMenuToggle }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [time, setTime]         = useState(new Date());
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fmt = (d) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  const fmtDate = (d) => d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <header style={{
      height: 58,
      display: 'flex',
      alignItems: 'center',
      padding: '0 20px',
      background: 'var(--navbar-bg)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--navbar-border)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      gap: 14,
    }}>
      {/* Hamburger */}
      <button
        onClick={onMenuToggle}
        className="md:hidden"
        style={{
          background: 'rgba(67, 47, 46, 0.06)',
          border: '1px solid var(--border-strong)',
          borderRadius: 8,
          width: 34, height: 34,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          color: 'var(--text)',
        }}
      >
        <Menu size={16} />
      </button>

      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 34, height: 34,
          background: '#432f2e',
          borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(67, 47, 46, 0.25)',
          flexShrink: 0,
          position: 'relative',
        }}>
          <Bell size={15} color="#feefb8" />
          {/* Status dot */}
          <div style={{
            position: 'absolute',
            top: -2, right: -2,
            width: 8, height: 8,
            background: '#c4dae8',
            borderRadius: '50%',
            border: '2px solid var(--bg)',
          }} />
        </div>
        <span style={{
          fontFamily: "'Playfair Display', 'Fraunces', serif",
          fontWeight: 700,
          fontSize: 18,
          color: 'var(--text)',
          letterSpacing: '-0.01em',
        }}>CognAlarm</span>
      </div>

      <div style={{ flex: 1 }} />

      {/* Live Clock */}
      <div className="sm:flex hidden" style={{
        flexDirection: 'column',
        alignItems: 'flex-end',
      }}>
        <div style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: 14,
          fontWeight: 700,
          fontVariantNumeric: 'tabular-nums',
          color: 'var(--text)',
          lineHeight: 1.1,
        }}>
          {fmt(time)}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, fontWeight: 500 }}>
          {fmtDate(time)}
        </div>
      </div>

      {/* Streak pill (Butter with Chocopie text) */}
      {user && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 12px',
          background: '#feefb8',
          border: '1px solid rgba(67, 47, 46, 0.15)',
          borderRadius: 20,
          fontSize: 12,
          fontWeight: 800,
          color: '#432f2e',
          boxShadow: '0 1px 4px rgba(67, 47, 46, 0.08)',
        }} title={`${user.streakCount ?? 0} day wake streak`}>
          <Flame size={13} color="#432f2e" />
          <span>{user.streakCount ?? 0}</span>
        </div>
      )}

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        title="Toggle theme"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 36, height: 36,
          background: 'var(--bg-hover)',
          border: '1px solid var(--border-strong)',
          borderRadius: 10,
          cursor: 'pointer',
          color: 'var(--text-secondary)',
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = '#feefb8'; e.currentTarget.style.color = '#432f2e'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
      >
        {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
      </button>

      {/* Profile dropdown */}
      {user && (
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setProfileOpen(o => !o)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: profileOpen ? 'var(--bg-active)' : 'var(--bg-hover)',
              border: '1px solid var(--border-strong)',
              borderRadius: 10,
              cursor: 'pointer',
              padding: '5px 12px 5px 6px',
              color: 'var(--text)',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text)'; }}
            onMouseLeave={e => { if (!profileOpen) e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
          >
            <div style={{
              width: 28, height: 28,
              borderRadius: '50%',
              background: '#432f2e',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 800, color: '#feefb8',
              flexShrink: 0,
            }}>
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <span style={{
              fontSize: 13, fontWeight: 700,
              maxWidth: 85, overflow: 'hidden',
              textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              color: 'var(--text)',
            }}>
              {user.name?.split(' ')[0]}
            </span>
            <ChevronDown size={12} color="var(--text-muted)" style={{ transition: 'transform 0.2s', transform: profileOpen ? 'rotate(180deg)' : 'none' }} />
          </button>

          {profileOpen && (
            <div style={{
              position: 'absolute', right: 0, top: 'calc(100% + 8px)',
              width: 220,
              background: 'var(--bg-card)',
              border: '1px solid var(--border-strong)',
              borderRadius: 14,
              boxShadow: '0 16px 40px rgba(67, 47, 46, 0.15)',
              zIndex: 60,
              overflow: 'hidden',
              animation: 'fadeIn 0.15s ease',
            }}>
              {/* User info */}
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-hover)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: '#432f2e',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 800, color: '#feefb8',
                  }}>
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>{user.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{user.email}</div>
                  </div>
                </div>
              </div>

              <div style={{ padding: '6px' }}>
                <Link
                  to="/settings"
                  onClick={() => setProfileOpen(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 9,
                    padding: '9px 12px',
                    fontSize: 13, color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    borderRadius: 8,
                    fontWeight: 600,
                    transition: 'all 0.12s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#feefb8'; e.currentTarget.style.color = '#432f2e'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >
                  <Settings size={14} /> Settings
                </Link>
                <button
                  onClick={() => { setProfileOpen(false); logout(); }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 9,
                    padding: '9px 12px',
                    fontSize: 13, color: 'var(--danger)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    borderRadius: 8,
                    fontWeight: 600,
                    transition: 'all 0.12s',
                    textAlign: 'left',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger-bg)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <LogOut size={14} /> Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
