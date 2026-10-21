import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Trash2, Save, Check, LogOut, Shield, User, Palette, Database, RefreshCw, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { checkSupabaseConnection, supabaseConfig } from '../services/supabaseClient';

function SettingSection({ icon: Icon, title, color = 'var(--accent-light)', children }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 16,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '15px 20px',
        borderBottom: '1px solid var(--border)',
        background: 'rgba(67, 47, 46, 0.06)',
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: 'rgba(67, 47, 46, 0.06)',
          border: '1px solid rgba(67, 47, 46, 0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={14} color={color} />
        </div>
        <span style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontWeight: 700, fontSize: 14 }}>{title}</span>
      </div>
      <div>{children}</div>
    </div>
  );
}

function SettingRow({ label, desc, children, danger }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 20px',
      gap: 16,
      borderBottom: '1px solid rgba(67, 47, 46, 0.06)',
      transition: 'background 0.12s',
    }}
    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(67, 47, 46, 0.06)'; }}
    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
    >
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: danger ? 'var(--danger)' : 'var(--text)' }}>{label}</div>
        {desc && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{desc}</div>}
      </div>
      {children}
    </div>
  );
}

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  display: 'block',
  padding: '11px 14px',
  background: 'rgba(67, 47, 46, 0.06)',
  border: '1px solid rgba(67, 47, 46, 0.06)',
  borderRadius: 10,
  fontSize: 14,
  color: 'var(--text)',
  outline: 'none',
  fontFamily: 'inherit',
  transition: 'all 0.2s',
};

export default function SettingsPage() {
  const { user, updateUserProfile, resetUserStats, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [form, setForm]         = useState({ name: user?.name || '', email: user?.email || '' });
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [resetting, setResetting] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState(null);
  const [testingDb, setTestingDb] = useState(false);

  const handleTestConnection = async () => {
    setTestingDb(true);
    const res = await checkSupabaseConnection();
    setSupabaseStatus(res);
    setTestingDb(false);
  };

  useEffect(() => {
    handleTestConnection();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUserProfile(form.name, form.email, user?.avatar);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleReset = async () => {
    if (!confirm('Reset ALL statistics and history? This cannot be undone.')) return;
    setResetting(true);
    try { await resetUserStats(); } catch (err) { console.error(err); }
    finally { setResetting(false); }
  };

  return (
    <div style={{ maxWidth: 620, margin: '0 auto', padding: '28px 24px' }} className="fade-in">

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          fontSize: 24, fontWeight: 800,
          color: 'var(--text)', marginBottom: 5,
        }}>Settings</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Manage your account and preferences.</p>
      </div>

      {/* Profile section */}
      <SettingSection icon={User} title="Profile">
        {/* Avatar row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14,
          padding: '18px 20px 14px',
          borderBottom: '1px solid var(--border)',
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            background: '#432f2e',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 800, color: '#feefb8',
            boxShadow: '0 4px 14px rgba(67, 47, 46, 0.2)',
            flexShrink: 0,
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontWeight: 700, fontSize: 16 }}>{user?.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{user?.email}</div>
            <div style={{
              marginTop: 5,
              display: 'flex', gap: 6,
            }}>
              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: 'rgba(44,94,59,0.12)', color: '#2c5e3b', border: '1px solid rgba(44,94,59,0.2)' }}>
                🔥 {user?.streakCount ?? 0} day streak
              </span>
              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: 'rgba(67,47,46,0.08)', color: '#432f2e', border: '1px solid rgba(67,47,46,0.15)' }}>
                🏆 Best: {user?.bestStreak ?? 0}
              </span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 7 }}>
              Full name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = 'var(--text)'; e.target.style.boxShadow = '0 0 0 3px rgba(67,47,46,0.1)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--border-strong)'; e.target.style.boxShadow = 'none'; }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 7 }}>
              Email address
            </label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = 'var(--text)'; e.target.style.boxShadow = '0 0 0 3px rgba(67,47,46,0.1)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--border-strong)'; e.target.style.boxShadow = 'none'; }}
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '10px 18px',
                background: saved ? '#2c5e3b' : '#432f2e',
                color: saved ? '#ffffff' : '#feefb8',
                border: '1px solid rgba(67,47,46,0.25)',
                borderRadius: 10,
                fontSize: 13, fontWeight: 700,
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1,
                transition: 'all 0.25s',
                boxShadow: '0 4px 14px rgba(67,47,46,0.15)',
              }}
            >
              {saved ? <><Check size={14} /> Saved!</> : <><Save size={14} /> {saving ? 'Saving…' : 'Save changes'}</>}
            </button>
          </div>
        </form>
      </SettingSection>

      {/* Appearance section */}
      <SettingSection icon={Palette} title="Appearance" color="#a78bfa">
        <SettingRow
          label={theme === 'dark' ? 'Dark mode' : 'Light mode'}
          desc="Toggle interface theme"
        >
          <label className="toggle">
            <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} />
            <span className="toggle-slider" />
          </label>
        </SettingRow>
      </SettingSection>

      {/* Supabase Database Connection */}
      <SettingSection icon={Database} title="Database & Cloud Connection" color="#3ecf8e">
        <SettingRow
          label="Database Provider"
          desc="Connected to remote PostgreSQL Cloud via Supabase"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '4px 12px', borderRadius: 20,
              fontSize: 12, fontWeight: 700,
              background: 'rgba(62,207,142,0.12)',
              border: '1px solid rgba(62,207,142,0.3)',
              color: '#3ecf8e',
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#3ecf8e', boxShadow: '0 0 8px #3ecf8e' }} />
              Supabase PostgreSQL
            </span>
          </div>
        </SettingRow>

        <SettingRow
          label="Project URL"
          desc={supabaseConfig.url}
        >
          <a
            href={supabaseConfig.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 12, color: 'var(--accent-light)',
              textDecoration: 'none', padding: '6px 10px',
              borderRadius: 8, background: 'rgba(67, 47, 46, 0.06)',
              border: '1px solid rgba(67, 47, 46, 0.06)',
            }}
          >
            Open <ExternalLink size={12} />
          </a>
        </SettingRow>

        <SettingRow
          label="Connection Status"
          desc={supabaseStatus ? `Latency: ${supabaseStatus.latencyMs}ms — ${supabaseStatus.statusText}` : 'Checking connection...'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {supabaseStatus?.connected ? (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                fontSize: 12, fontWeight: 700, color: '#432f2e',
              }}>
                <CheckCircle2 size={15} /> Active
              </span>
            ) : supabaseStatus ? (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                fontSize: 12, fontWeight: 700, color: '#f59e0b',
              }}>
                <AlertCircle size={15} /> Offline
              </span>
            ) : (
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Testing...</span>
            )}
            <button
              onClick={handleTestConnection}
              disabled={testingDb}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '6px 12px',
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'var(--bg-surface)',
                color: 'var(--text)',
                fontSize: 12, fontWeight: 600,
                cursor: testingDb ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <RefreshCw size={12} style={{ animation: testingDb ? 'spin 0.8s linear infinite' : 'none' }} />
              {testingDb ? 'Pinging…' : 'Ping DB'}
            </button>
          </div>
        </SettingRow>

        <div style={{
          padding: '12px 20px',
          background: 'rgba(62,207,142,0.04)',
          borderTop: '1px solid rgba(62,207,142,0.12)',
          fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5,
        }}>
          💡 Database keys configured from your Supabase project. A complete SQL schema script has been created at <code>supabase_schema.sql</code> to create <code>alarms</code>, <code>profiles</code>, and <code>history_logs</code> tables if not already created.
        </div>
      </SettingSection>

      {/* Danger zone */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid rgba(244,63,94,0.2)',
        borderRadius: 16,
        overflow: 'hidden',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '15px 20px',
          borderBottom: '1px solid rgba(244,63,94,0.12)',
          background: 'rgba(244,63,94,0.04)',
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: 'rgba(244,63,94,0.1)',
            border: '1px solid rgba(244,63,94,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Shield size={14} color="#5c3e38" />
          </div>
          <span style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontWeight: 700, fontSize: 14, color: '#5c3e38' }}>
            Danger Zone
          </span>
        </div>

        <SettingRow
          label="Reset statistics"
          desc="Clear all streaks, history, and Supabase cloud data"
          danger
        >
          <button
            onClick={handleReset}
            disabled={resetting}
            className="btn-danger"
            style={{ fontSize: 12, flexShrink: 0 }}
          >
            <Trash2 size={12} /> {resetting ? 'Resetting…' : 'Reset'}
          </button>
        </SettingRow>

        <SettingRow
          label="Sign out"
          desc="Log out of your CognAlarm account"
          danger
        >
          <button
            onClick={logout}
            className="btn-danger"
            style={{ fontSize: 12, flexShrink: 0 }}
          >
            <LogOut size={12} /> Sign out
          </button>
        </SettingRow>
      </div>
    </div>
  );
}
