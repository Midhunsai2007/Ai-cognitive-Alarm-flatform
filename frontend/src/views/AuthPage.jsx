import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRole } from '../context/RoleContext';
import { authAPI } from '../services/api';
import { Eye, EyeOff, Bell, ArrowRight, ArrowLeft, Brain, UserCheck, HeartPulse, ShieldCheck, Sparkles, CheckCircle2, KeyRound, Mail, Lock } from 'lucide-react';

const ROLES = [
  {
    id: 'user',
    label: 'User',
    icon: UserCheck,
    badge: '👤 User Portal',
    color: '#432f2e',
    bg: '#feefb8',
    desc: 'Personal wake alarms, adaptive cognitive puzzles & analytics',
  },
  {
    id: 'coach',
    label: 'Wellness Coach',
    icon: HeartPulse,
    badge: '🧘 Wellness Coach',
    color: '#233744',
    bg: '#c4dae8',
    desc: 'Client behavior patterns, sleep debt telemetry & interventions',
  },
  {
    id: 'admin',
    label: 'Admin',
    icon: ShieldCheck,
    badge: '🛡️ System Admin',
    color: '#432f2e',
    bg: '#feefb8',
    desc: 'Platform governance, ML engine telemetry & user administration',
  },
];

export default function AuthPage() {
  const { login, signup, user } = useAuth();
  const { checkRoleLogin } = useRole();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState('user');
  const [mode, setMode]                 = useState(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      const m = p.get('mode');
      if (m === 'signup') return 'signup';
      if (m === 'forgot' || m === 'forgot_password') return 'forgot_password';
      if (m === 'reset' || m === 'reset_password') return 'reset_password';
    }
    return 'login';
  });

  const [form, setForm] = useState(() => {
    let initialEmail = '';
    let initialCode = '';
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      initialEmail = p.get('email') || '';
      initialCode = p.get('code') || p.get('token') || '';
    }
    return {
      name: '',
      email: initialEmail,
      password: '',
      code: initialCode,
      newPassword: '',
      confirmPassword: '',
    };
  });

  const [showPw, setShowPw]             = useState(false);
  const [showNewPw, setShowNewPw]       = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [successMsg, setSuccessMsg]     = useState('');

  const activeRoleConfig = ROLES.find(r => r.id === selectedRole) || ROLES[0];

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    setError('');
    setSuccessMsg('');
    setForm(prev => ({ ...prev, name: '', password: '', newPassword: '', confirmPassword: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (mode === 'login') {

        // ── Coach login ──
        if (selectedRole === 'coach') {
          const ok = checkRoleLogin(form.email.trim(), form.password);
          if (ok?.role === 'coach') {
            navigate('/coach');
          } else {
            setError('Invalid coach credentials. Please check your email and password.');
          }
          return;
        }

        // ── Admin login ──
        if (selectedRole === 'admin') {
          const ok = checkRoleLogin(form.email.trim(), form.password);
          if (ok?.role === 'admin') {
            navigate('/admin');
          } else {
            setError('Invalid admin credentials. Please check your email and password.');
          }
          return;
        }

        // ── Standard User login ──
        const roleResult = checkRoleLogin(form.email.trim(), form.password);
        if (roleResult?.role === 'coach') { navigate('/coach'); return; }
        if (roleResult?.role === 'admin') { navigate('/admin'); return; }

        await login(form.email, form.password);
        navigate('/dashboard');

      } else if (mode === 'signup') {
        await signup(form.name, form.email, form.password);
        navigate('/dashboard');

      } else if (mode === 'forgot_password') {
        if (!form.email || !form.email.includes('@')) {
          setError('Please enter a valid email address.');
          return;
        }
        const res = await authAPI.forgotPassword(form.email);
        setSuccessMsg(res.message || `A verification code was dispatched to ${form.email}.`);
        if (res.code) {
          // Pre-populate code if provided
          setForm(prev => ({ ...prev, code: res.code }));
        }
        // Switch to reset_password mode so user can immediately complete the reset
        setMode('reset_password');

      } else if (mode === 'reset_password') {
        if (!form.email || !form.email.includes('@')) {
          setError('Please provide your registered email address.');
          return;
        }
        if (!form.code || form.code.trim().length < 4) {
          setError('Please enter the 6-digit verification code sent to your email.');
          return;
        }
        if (!form.newPassword || form.newPassword.length < 6) {
          setError('New password must be at least 6 characters long.');
          return;
        }
        if (form.newPassword !== form.confirmPassword) {
          setError('Passwords do not match. Please verify your new password.');
          return;
        }

        const res = await authAPI.resetPassword(form.email, form.code.trim(), form.newPassword);
        setSuccessMsg(res.message || 'Password successfully updated! Logging you in...');

        try {
          await login(form.email, form.newPassword);
          setTimeout(() => navigate('/dashboard'), 1200);
        } catch {
          setMode('login');
          setForm(prev => ({ ...prev, password: form.newPassword }));
        }
      }
    } catch (err) {
      setError(err.message || 'Action could not be completed. Please check your information.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    boxSizing: 'border-box',
    display: 'block',
    padding: '12px 16px',
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-strong)',
    borderRadius: 12,
    fontSize: 14,
    color: 'var(--text)',
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      padding: 24,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Back to Home / Landing link */}
      <button
        type="button"
        onClick={() => navigate('/')}
        style={{
          position: 'absolute',
          top: 24,
          left: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          background: 'var(--bg-card)',
          border: '1px solid var(--border-strong)',
          borderRadius: 12,
          padding: '9px 16px',
          color: 'var(--text)',
          fontSize: 13,
          fontWeight: 700,
          cursor: 'pointer',
          zIndex: 20,
          boxShadow: '0 4px 12px rgba(67, 47, 46, 0.08)',
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(-2px)'; e.currentTarget.style.background = 'var(--bg-hover)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.background = 'var(--bg-card)'; }}
      >
        <ArrowLeft size={16} />
        <span>Back to Landing Page</span>
      </button>

      {/* Background ambient lighting in Blue and Butter */}
      <div style={{
        position: 'absolute',
        top: '-15%', left: '-10%',
        width: '50vw', height: '50vw',
        background: 'radial-gradient(ellipse, rgba(196, 218, 232, 0.45) 0%, transparent 70%)',
        animation: 'blob-pulse 8s ease-in-out infinite',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-15%', right: '-10%',
        width: '45vw', height: '45vw',
        background: 'radial-gradient(ellipse, rgba(254, 239, 184, 0.4) 0%, transparent 70%)',
        animation: 'blob-pulse 10s ease-in-out infinite reverse',
        pointerEvents: 'none',
      }} />

      {/* Main Auth Container */}
      <div style={{
        width: '100%',
        maxWidth: 460,
        boxSizing: 'border-box',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-strong)',
        borderRadius: 24,
        padding: '36px 32px',
        boxShadow: '0 24px 60px rgba(67, 47, 46, 0.08)',
        position: 'relative',
        zIndex: 1,
        animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>


        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: 26 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            background: 'var(--bg-hover)',
            border: '1px solid var(--border)',
            borderRadius: 14,
            padding: '8px 16px',
            marginBottom: 16,
          }}>
            <div style={{
              width: 32, height: 32,
              borderRadius: 10,
              background: '#432f2e',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Brain size={17} color="#feefb8" />
            </div>
            <span style={{
              fontFamily: "'Lora', Georgia, 'Times New Roman', serif",
              fontWeight: 700,
              fontSize: 19,
              color: 'var(--text)',
              letterSpacing: '-0.01em',
            }}>
              CognAlarm
            </span>
          </div>

          <h1 style={{
            fontFamily: "'Lora', Georgia, 'Times New Roman', serif",
            fontSize: 24,
            fontWeight: 700,
            color: 'var(--text)',
            marginBottom: 6,
          }}>
            {mode === 'login' && 'Welcome Back'}
            {mode === 'signup' && 'Create an Account'}
            {mode === 'forgot_password' && 'Reset Password'}
            {mode === 'reset_password' && 'Set New Password'}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>
            {mode === 'login' && 'Cognitive wake platform with adaptive neural challenges'}
            {mode === 'signup' && 'Join the autonomous cognitive wakefulness network'}
            {mode === 'forgot_password' && 'Enter your email to receive a password reset code'}
            {mode === 'reset_password' && 'Enter verification code and choose your new password'}
          </p>
        </div>

        {/* ── Security recovery badge when resetting password ── */}
        {(mode === 'forgot_password' || mode === 'reset_password') && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-hover)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: '10px 14px',
            marginBottom: 20,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <KeyRound size={16} color="#432f2e" />
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>
                Account Security Recovery
              </span>
            </div>
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
              style={{
                background: 'none',
                border: 'none',
                fontSize: 12,
                fontWeight: 700,
                color: '#432f2e',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Back to Sign In
            </button>
          </div>
        )}

        {/* ── Role Selector Section (visible in Login / Signup modes) ── */}
        {(mode === 'login' || mode === 'signup') && (
          <div style={{ marginBottom: 22 }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 10,
            }}>
              <label style={{
                fontSize: 11,
                fontWeight: 800,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}>
                Select Login Role
              </label>
              <span style={{
                fontSize: 11,
                fontWeight: 800,
                padding: '3px 9px',
                borderRadius: 12,
                background: activeRoleConfig.bg,
                color: activeRoleConfig.color,
                border: '1px solid rgba(67, 47, 46, 0.15)',
              }}>
                {activeRoleConfig.badge}
              </span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 10,
            }}>
              {ROLES.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.id;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => handleRoleSelect(role.id)}
                    style={{
                      boxSizing: 'border-box',
                      padding: '12px 6px',
                      borderRadius: 14,
                      border: isSelected ? '2px solid #432f2e' : '1px solid var(--border)',
                      background: isSelected ? role.bg : 'var(--bg-hover)',
                      color: isSelected ? '#432f2e' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: 84,
                      gap: 7,
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 4px 14px rgba(67, 47, 46, 0.12)' : 'none',
                      transform: isSelected ? 'scale(1.02)' : 'none',
                    }}
                  >
                    <div style={{
                      width: 32, height: 32,
                      borderRadius: 8,
                      background: isSelected ? '#432f2e' : 'var(--bg-surface)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s',
                      flexShrink: 0,
                    }}>
                      <Icon size={16} color={isSelected ? '#feefb8' : 'var(--text-muted)'} />
                    </div>
                    <span style={{
                      fontSize: 12,
                      fontWeight: 700,
                      textAlign: 'center',
                      lineHeight: 1.25,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {role.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <div style={{
              fontSize: 11,
              color: 'var(--text-muted)',
              marginTop: 8,
              textAlign: 'center',
              lineHeight: 1.4,
            }}>
              {activeRoleConfig.desc}
            </div>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div style={{
            background: 'rgba(34, 197, 94, 0.12)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: 10,
            padding: '11px 14px',
            marginBottom: 18,
            fontSize: 13,
            color: '#16a34a',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            animation: 'fadeIn 0.15s ease',
          }}>
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.25)',
            borderRadius: 10,
            padding: '10px 14px',
            marginBottom: 18,
            fontSize: 13,
            color: '#f43f5e',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            animation: 'fadeIn 0.15s ease',
          }}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%', boxSizing: 'border-box' }}>
          
          {/* Full Name (Sign Up only) */}
          {mode === 'signup' && (
            <div style={{ width: '100%', boxSizing: 'border-box' }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                Full Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Alex Johnson"
                required
                style={inputStyle}
                onFocus={e => {
                  e.target.style.borderColor = activeRoleConfig.color;
                  e.target.style.boxShadow = `0 0 0 3px ${activeRoleConfig.bg}`;
                }}
                onBlur={e => {
                  e.target.style.borderColor = 'var(--border-strong)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          )}

          {/* Email Address */}
          <div style={{ width: '100%', boxSizing: 'border-box' }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
              Email Address
            </label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              placeholder={selectedRole === 'user' ? 'alex@example.com' : 'Enter your email'}
              required
              style={inputStyle}
              onFocus={e => {
                e.target.style.borderColor = activeRoleConfig.color;
                e.target.style.boxShadow = `0 0 0 3px ${activeRoleConfig.bg}`;
              }}
              onBlur={e => {
                e.target.style.borderColor = 'var(--border-strong)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Verification Code (Reset Password mode) */}
          {mode === 'reset_password' && (
            <div style={{ width: '100%', boxSizing: 'border-box' }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                6-Digit Verification Code
              </label>
              <input
                type="text"
                maxLength={8}
                value={form.code}
                onChange={e => setForm(p => ({ ...p, code: e.target.value }))}
                placeholder="e.g. 842109"
                required
                style={{ ...inputStyle, letterSpacing: '2px', fontWeight: 700 }}
                onFocus={e => {
                  e.target.style.borderColor = activeRoleConfig.color;
                  e.target.style.boxShadow = `0 0 0 3px ${activeRoleConfig.bg}`;
                }}
                onBlur={e => {
                  e.target.style.borderColor = 'var(--border-strong)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                Check your email inbox or spam folder for the 6-digit code.
              </span>
            </div>
          )}

          {/* Password (Login & Sign Up modes) */}
          {(mode === 'login' || mode === 'signup') && (
            <div style={{ width: '100%', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>
                  Password
                </label>
                {mode === 'login' && selectedRole === 'user' && (
                  <button
                    type="button"
                    onClick={() => { setMode('forgot_password'); setError(''); setSuccessMsg(''); }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#432f2e',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      padding: 0,
                      textDecoration: 'underline',
                    }}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div style={{ position: 'relative', width: '100%', boxSizing: 'border-box' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  required
                  style={{ ...inputStyle, paddingRight: 44 }}
                  onFocus={e => {
                    e.target.style.borderColor = activeRoleConfig.color;
                    e.target.style.boxShadow = `0 0 0 3px ${activeRoleConfig.bg}`;
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = 'var(--border-strong)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: 6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 6,
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          )}

          {/* New Password & Confirm Password (Reset Password mode) */}
          {mode === 'reset_password' && (
            <>
              <div style={{ width: '100%', boxSizing: 'border-box' }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                  New Password
                </label>
                <div style={{ position: 'relative', width: '100%', boxSizing: 'border-box' }}>
                  <input
                    type={showNewPw ? 'text' : 'password'}
                    value={form.newPassword}
                    onChange={e => setForm(p => ({ ...p, newPassword: e.target.value }))}
                    placeholder="At least 6 characters"
                    required
                    style={{ ...inputStyle, paddingRight: 44 }}
                    onFocus={e => {
                      e.target.style.borderColor = activeRoleConfig.color;
                      e.target.style.boxShadow = `0 0 0 3px ${activeRoleConfig.bg}`;
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = 'var(--border-strong)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(p => !p)}
                    aria-label={showNewPw ? 'Hide password' : 'Show password'}
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: 6,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 6,
                      transition: 'color 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div style={{ width: '100%', boxSizing: 'border-box' }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                  Confirm New Password
                </label>
                <input
                  type={showNewPw ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
                  placeholder="Re-enter new password"
                  required
                  style={inputStyle}
                  onFocus={e => {
                    e.target.style.borderColor = activeRoleConfig.color;
                    e.target.style.boxShadow = `0 0 0 3px ${activeRoleConfig.bg}`;
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = 'var(--border-strong)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </>
          )}

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              marginTop: 8,
              padding: '13px 20px',
              borderRadius: 12,
              border: 'none',
              background: '#432f2e',
              color: '#feefb8',
              fontSize: 14,
              fontWeight: 800,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 4px 16px rgba(67, 47, 46, 0.2)',
              transition: 'all 0.2s',
              opacity: loading ? 0.8 : 1,
            }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = '#583e3d'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
            onMouseLeave={e => { if (!loading) { e.currentTarget.style.background = '#432f2e'; e.currentTarget.style.transform = 'none'; } }}
          >
            {loading ? (
              <span>Processing...</span>
            ) : (
              <>
                {mode === 'login' && <span>Sign In to {activeRoleConfig.label}</span>}
                {mode === 'signup' && <span>Create Account</span>}
                {mode === 'forgot_password' && <span>Send Verification Code</span>}
                {mode === 'reset_password' && <span>Reset Password & Sign In</span>}
                <ArrowRight size={15} color="#feefb8" />
              </>
            )}
          </button>
        </form>

        {/* Toggle Mode Footer */}
        <div style={{
          marginTop: 22,
          textAlign: 'center',
          fontSize: 13,
          color: 'var(--text-muted)',
          fontWeight: 500,
        }}>
          {mode === 'login' && selectedRole === 'user' && (
            <>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => { setMode('signup'); setError(''); setSuccessMsg(''); }}
                style={{
                  background: 'none', border: 'none',
                  color: '#432f2e', fontWeight: 800,
                  cursor: 'pointer', fontSize: 13,
                  textDecoration: 'underline',
                }}
              >
                Sign up free
              </button>
            </>
          )}

          {mode === 'signup' && selectedRole === 'user' && (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
                style={{
                  background: 'none', border: 'none',
                  color: '#432f2e', fontWeight: 800,
                  cursor: 'pointer', fontSize: 13,
                  textDecoration: 'underline',
                }}
              >
                Sign in
              </button>
            </>
          )}

          {mode === 'forgot_password' && (
            <>
              Remember your password?{' '}
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
                style={{
                  background: 'none', border: 'none',
                  color: '#432f2e', fontWeight: 800,
                  cursor: 'pointer', fontSize: 13,
                  textDecoration: 'underline',
                }}
              >
                Back to Sign in
              </button>
            </>
          )}

          {mode === 'reset_password' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div>
                Didn't receive the code?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('forgot_password'); setError(''); setSuccessMsg(''); }}
                  style={{
                    background: 'none', border: 'none',
                    color: '#432f2e', fontWeight: 800,
                    cursor: 'pointer', fontSize: 13,
                    textDecoration: 'underline',
                  }}
                >
                  Resend code
                </button>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
                  style={{
                    background: 'none', border: 'none',
                    color: 'var(--text-muted)', fontWeight: 600,
                    cursor: 'pointer', fontSize: 12,
                    textDecoration: 'underline',
                  }}
                >
                  Cancel and return to Sign in
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes blob-pulse {
          0%, 100% { transform: scale(1) translate(0, 0); }
          50%       { transform: scale(1.08) translate(3%, 3%); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
