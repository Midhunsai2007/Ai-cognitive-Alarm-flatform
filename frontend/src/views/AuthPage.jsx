import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRole } from '../context/RoleContext';
import { Eye, EyeOff, Bell, ArrowRight, Brain, UserCheck, HeartPulse, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

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
  const { login, signup } = useAuth();
  const { checkRoleLogin } = useRole();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState('user');
  const [mode, setMode]                 = useState('login');
  const [form, setForm]                 = useState({ name: '', email: '', password: '' });
  const [showPw, setShowPw]             = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');

  const activeRoleConfig = ROLES.find(r => r.id === selectedRole) || ROLES[0];

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    setError('');
    setForm({ name: '', email: '', password: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
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
        // (also allow coach/admin creds typed on the User tab)
        const roleResult = checkRoleLogin(form.email.trim(), form.password);
        if (roleResult?.role === 'coach') { navigate('/coach'); return; }
        if (roleResult?.role === 'admin') { navigate('/admin'); return; }

        await login(form.email, form.password);
        navigate('/');

      } else {
        await signup(form.name, form.email, form.password);
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-strong)',
    borderRadius: 10,
    fontSize: 14,
    color: 'var(--text)',
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'all 0.2s',
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
            {mode === 'login' ? 'Welcome Back' : 'Create an Account'}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>
            Cognitive wake platform with adaptive neural challenges
          </p>
        </div>

        {/* ── Role Selector Section ── */}
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
                    padding: '12px 8px',
                    borderRadius: 14,
                    border: isSelected ? '2px solid #432f2e' : '1px solid var(--border)',
                    background: isSelected ? role.bg : 'var(--bg-hover)',
                    color: isSelected ? '#432f2e' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
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
                  }}>
                    <Icon size={16} color={isSelected ? '#feefb8' : 'var(--text-muted)'} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>
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
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {mode === 'signup' && (
            <div>
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
                onFocus={e => e.target.style.borderColor = activeRoleConfig.color}
                onBlur={e => e.target.style.borderColor = 'var(--border-strong)'}
              />
            </div>
          )}

          <div>
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
              onFocus={e => e.target.style.borderColor = activeRoleConfig.color}
              onBlur={e => e.target.style.borderColor = 'var(--border-strong)'}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder="••••••••"
                required
                style={{ ...inputStyle, paddingRight: 42 }}
                onFocus={e => e.target.style.borderColor = activeRoleConfig.color}
                onBlur={e => e.target.style.borderColor = 'var(--border-strong)'}
              />
              <button
                type="button"
                onClick={() => setShowPw(p => !p)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
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
              <span>Authenticating...</span>
            ) : (
              <>
                <span>{mode === 'login' ? `Sign In to ${activeRoleConfig.label}` : 'Create Account'}</span>
                <ArrowRight size={15} color="#feefb8" />
              </>
            )}
          </button>
        </form>

        {/* Toggle Mode Footer */}
        {selectedRole === 'user' && (
          <div style={{
            marginTop: 22,
            textAlign: 'center',
            fontSize: 13,
            color: 'var(--text-muted)',
            fontWeight: 500,
          }}>
            {mode === 'login' ? (
              <>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setError(''); }}
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
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(''); }}
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
          </div>
        )}
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
