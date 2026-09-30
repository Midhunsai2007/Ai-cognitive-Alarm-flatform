import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useRole } from '../../context/RoleContext';
import { Heart, Eye, EyeOff, ArrowRight, ArrowLeft, Brain } from 'lucide-react';

export default function CoachLoginPage() {
  const { loginAsCoach } = useRole();
  const navigate = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      loginAsCoach(form.email, form.password);
      navigate('/coach');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '12px 16px',
    background: 'rgba(16,185,129,0.06)',
    border: '1px solid rgba(16,185,129,0.22)',
    borderRadius: 10, fontSize: 14, color: 'var(--text)',
    outline: 'none', fontFamily: 'inherit', transition: 'all 0.2s',
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', padding: 20, position: 'relative', overflow: 'hidden',
    }}>
      {/* Green ambient blobs */}
      <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(ellipse, rgba(16,185,129,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '45vw', height: '45vw', background: 'radial-gradient(ellipse, rgba(5,150,105,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Back link */}
      <Link to="/" style={{
        position: 'absolute', top: 20, left: 20,
        display: 'flex', alignItems: 'center', gap: 6,
        fontSize: 13, fontWeight: 600, color: 'var(--text-muted)',
        textDecoration: 'none', transition: 'color 0.15s',
      }}
        onMouseEnter={e => { e.currentTarget.style.color = '#10b981'; }}
        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; }}
      >
        <ArrowLeft size={15} /> Back to Portals
      </Link>

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: 420,
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(16,185,129,0.2)',
        borderRadius: 20, padding: '40px 36px',
        boxShadow: '0 24px 80px rgba(0,0,0,0.3), 0 0 0 1px rgba(16,185,129,0.05)',
        position: 'relative', zIndex: 10,
        animation: 'slideUp 0.4s ease both',
      }}>
        {/* Top accent line */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, transparent, #10b981, transparent)', borderRadius: '20px 20px 0 0', opacity: 0.8 }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 30 }}>
          <div style={{
            width: 46, height: 46,
            background: 'linear-gradient(135deg, #10b981, #059669)',
            borderRadius: 13,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 24px rgba(16,185,129,0.5)',
            animation: 'float 4s ease-in-out infinite',
          }}>
            <Heart size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 18, color: '#10b981', lineHeight: 1 }}>
              Wellness Coach
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Brain size={10} /> CognAlarm Portal
            </div>
          </div>
        </div>

        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>
          Coach Sign In
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 26 }}>
          Access your wellness coaching dashboard.
        </p>

        {/* Demo hint */}
        <div style={{
          padding: '10px 12px', marginBottom: 20,
          background: 'rgba(16,185,129,0.07)',
          border: '1px solid rgba(16,185,129,0.2)',
          borderRadius: 8, fontSize: 12, color: '#10b981',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span>🌿</span>
          <span>Demo: <strong>coach@cogn.ai</strong> / <strong>coach123</strong></span>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 7 }}>Email address</label>
            <input
              type="email" value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              placeholder="coach@cogn.ai" required style={inputStyle}
              onFocus={e => { e.target.style.borderColor = '#10b981'; e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.2)'; e.target.style.background = 'rgba(16,185,129,0.1)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(16,185,129,0.22)'; e.target.style.boxShadow = 'none'; e.target.style.background = 'rgba(16,185,129,0.06)'; }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 7 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'} value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder="Your password" required style={{ ...inputStyle, paddingRight: 46 }}
                onFocus={e => { e.target.style.borderColor = '#10b981'; e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.2)'; e.target.style.background = 'rgba(16,185,129,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(16,185,129,0.22)'; e.target.style.boxShadow = 'none'; e.target.style.background = 'rgba(16,185,129,0.06)'; }}
              />
              <button type="button" onClick={() => setShowPw(s => !s)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#10b981'; }} onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; }}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{ padding: '10px 14px', background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.22)', borderRadius: 8, fontSize: 13, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--danger)', flexShrink: 0 }} /> {error}
            </div>
          )}

          <button
            type="submit" disabled={loading}
            style={{
              width: '100%', padding: '12px 20px',
              background: loading ? 'rgba(16,185,129,0.3)' : 'linear-gradient(135deg, #10b981, #059669)',
              color: '#fff', border: 'none', borderRadius: 10,
              fontSize: 14, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif",
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all 0.2s', marginTop: 4,
              boxShadow: loading ? 'none' : '0 4px 24px rgba(16,185,129,0.4)',
            }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(16,185,129,0.55)'; } }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(16,185,129,0.4)'; }}
          >
            {loading
              ? <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              : <><span>Access Dashboard</span><ArrowRight size={15} /></>}
          </button>
        </form>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-5px); } }
      `}</style>
    </div>
  );
}
