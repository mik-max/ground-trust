import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerParticipant } from '../../services/auth.service';
import useAuthStore from '../../store/auth.store';
import type { ApiError } from '../../types';
import { AxiosError } from 'axios';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  fontSize: '14px',
  border: '1px solid var(--border-default)',
  borderRadius: '8px',
  backgroundColor: 'var(--bg-page)',
  color: 'var(--text-primary)',
  outline: 'none',
  fontFamily: 'var(--font-sans)',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '14px',
  fontWeight: 500,
  color: 'var(--text-primary)',
  marginBottom: '6px',
};

export default function RegisterParticipant() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!agreed) { setError('Please accept the terms to continue.'); return; }
    setError('');
    setLoading(true);

    try {
      const { data } = await registerParticipant({ name, email, password });
      setAuth(data.user, data.token);
      navigate('/browse');
    } catch (err) {
      const axiosErr = err as AxiosError<ApiError>;
      const fieldErrors = axiosErr.response?.data?.errors;
      setError(
        fieldErrors?.[0]?.msg || axiosErr.response?.data?.message || 'Something went wrong.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-page)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: '22px', fontWeight: 700, color: 'var(--brand-primary)', letterSpacing: '-0.5px' }}>
              RaffleTrust
            </span>
          </Link>
          <p style={{ marginTop: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
            Create a participant account
          </p>
        </div>

        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-default)',
          borderRadius: '12px',
          padding: '32px',
        }}>
          {error && (
            <div style={{
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '20px',
              fontSize: '14px',
              color: 'var(--status-error)',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={labelStyle}>Full name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = 'var(--brand-primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-default)'}
              />
            </div>

            <div>
              <label style={labelStyle}>Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = 'var(--brand-primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-default)'}
              />
            </div>

            <div>
              <label style={labelStyle}>Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = 'var(--brand-primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-default)'}
              />
            </div>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                style={{ marginTop: '2px', accentColor: 'var(--brand-primary)', flexShrink: 0 }}
              />
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                I agree to the{' '}
                <Link to="/terms" style={{ color: 'var(--brand-primary)', textDecoration: 'none' }}>Terms of Service</Link>
                {' '}and{' '}
                <Link to="/privacy" style={{ color: 'var(--brand-primary)', textDecoration: 'none' }}>Privacy Policy</Link>
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '11px',
                fontSize: '15px',
                fontWeight: 600,
                color: '#FFFFFF',
                backgroundColor: loading ? 'var(--text-secondary)' : 'var(--brand-primary)',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-sans)',
              }}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)', marginTop: '24px' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--brand-primary)', fontWeight: 600, textDecoration: 'none' }}>
              Log in
            </Link>
          </p>
        </div>

        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          Registering as a business?{' '}
          <Link to="/register/business" style={{ color: 'var(--brand-accent)', fontWeight: 500, textDecoration: 'none' }}>
            Switch here
          </Link>
        </p>
      </div>
    </div>
  );
}
