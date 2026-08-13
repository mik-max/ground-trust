import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../../services/auth.service';
import useAuthStore from '../../store/auth.store';
import type { ApiError } from '../../types';
import { AxiosError } from 'axios';

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await login({ email, password });
      setAuth(data.user, data.token);
      navigate(data.user.role === 'BUSINESS' ? '/business/dashboard' : '/browse');
    } catch (err) {
      const axiosErr = err as AxiosError<ApiError>;
      setError(axiosErr.response?.data?.message || 'Something went wrong. Please try again.');
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

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <span style={{
              fontSize: '22px',
              fontWeight: 700,
              color: 'var(--brand-primary)',
              letterSpacing: '-0.5px',
            }}>
              RaffleTrust
            </span>
          </Link>
          <p style={{
            marginTop: '8px',
            fontSize: '14px',
            color: 'var(--text-secondary)',
          }}>
            Sign in to your account
          </p>
        </div>

        {/* Card */}
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
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 500,
                color: 'var(--text-primary)',
                marginBottom: '6px',
              }}>
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  fontSize: '14px',
                  border: '1px solid var(--border-default)',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-page)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  fontFamily: 'var(--font-sans)',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--brand-primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-default)'}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                }}>
                  Password
                </label>
                <Link to="/forgot-password" style={{
                  fontSize: '13px',
                  color: 'var(--brand-primary)',
                  textDecoration: 'none',
                  fontWeight: 500,
                }}>
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  fontSize: '14px',
                  border: '1px solid var(--border-default)',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-page)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  fontFamily: 'var(--font-sans)',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--brand-primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-default)'}
              />
            </div>

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
                transition: 'background-color 0.15s ease',
              }}
            >
              {loading ? 'Signing in...' : 'Log In'}
            </button>
          </form>

          {/* Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            margin: '24px 0',
          }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-default)' }} />
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>or</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-default)' }} />
          </div>

          <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{
              color: 'var(--brand-primary)',
              fontWeight: 600,
              textDecoration: 'none',
            }}>
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
