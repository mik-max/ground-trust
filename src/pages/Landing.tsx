import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import useAuthStore from '../store/auth.store';

interface Stats {
  raffles: number;
  entries: number;
  draws: number;
}

function Navbar({ isAuthenticated, userRole }: { isAuthenticated: boolean; userRole?: string }) {
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 20,
      backgroundColor: 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(8px)',
      borderBottom: '1px solid var(--border-default)',
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--brand-primary)', letterSpacing: '-0.5px' }}>
            RaffleTrust
          </span>
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isAuthenticated ? (
            <>
              <Link to="/browse" style={{ padding: '8px 16px', fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)', textDecoration: 'none', borderRadius: '8px' }}>
                Browse
              </Link>
              <Link
                to={userRole === 'BUSINESS' ? '/business/dashboard' : '/dashboard'}
                style={{ padding: '8px 16px', fontSize: '14px', fontWeight: 600, color: '#FFFFFF', backgroundColor: 'var(--brand-primary)', textDecoration: 'none', borderRadius: '8px' }}
              >
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" style={{ padding: '8px 16px', fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)', textDecoration: 'none', borderRadius: '8px' }}>
                Log in
              </Link>
              <Link to="/register" style={{ padding: '8px 16px', fontSize: '14px', fontWeight: 600, color: '#FFFFFF', backgroundColor: 'var(--brand-primary)', textDecoration: 'none', borderRadius: '8px' }}>
                Get started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

function StatCounter({ value, label }: { value: number | null; label: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ fontSize: '36px', fontWeight: 800, color: 'var(--brand-primary)', letterSpacing: '-1px', marginBottom: '4px' }}>
        {value === null ? '—' : value.toLocaleString()}
      </p>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{label}</p>
    </div>
  );
}

const FEATURES = [
  {
    icon: '🎲',
    title: 'Cryptographically fair',
    body: 'Every draw uses a CSPRNG seed generated at draw time. The seed is published alongside the result so anyone can replay the selection and confirm the outcome.',
  },
  {
    icon: '🔍',
    title: 'Fraud detection',
    body: 'Entries are automatically scored for suspicious patterns — new accounts, abnormal entry frequency, and other signals — before being counted in the draw pool.',
  },
  {
    icon: '📋',
    title: 'Append-only audit log',
    body: 'Once a draw runs, the participant count, random seed, algorithm, and winner IDs are locked in an immutable record. No edits, no do-overs.',
  },
];

const HOW_PARTICIPANT = [
  { step: '1', text: 'Create a free account' },
  { step: '2', text: 'Browse active raffles and click Enter' },
  { step: '3', text: 'Watch the draw — verify the result yourself using the published seed' },
];

const HOW_BUSINESS = [
  { step: '1', text: 'Register a business account' },
  { step: '2', text: 'Create a raffle — set the prize, dates, and entry limit' },
  { step: '3', text: 'Run the draw when entries close — audit log is published instantly' },
];

export default function Landing() {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api.get<Stats>('/stats').then(({ data }) => setStats(data)).catch(() => {});
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-page)' }}>
      <Navbar isAuthenticated={isAuthenticated} userRole={user?.role} />

      {/* Hero */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '96px 24px 80px', textAlign: 'center' }}>
        <div style={{
          display: 'inline-block',
          fontSize: '12px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: 'var(--brand-primary)',
          backgroundColor: '#EFF6FF',
          padding: '4px 12px',
          borderRadius: '20px',
          marginBottom: '24px',
        }}>
          Transparent · Auditable · Fair
        </div>

        <h1 style={{
          fontSize: 'clamp(36px, 6vw, 60px)',
          fontWeight: 800,
          color: 'var(--text-primary)',
          lineHeight: 1.1,
          letterSpacing: '-1.5px',
          marginBottom: '20px',
          maxWidth: '760px',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}>
          Raffles that anyone can verify
        </h1>

        <p style={{
          fontSize: '18px',
          color: 'var(--text-secondary)',
          lineHeight: 1.7,
          maxWidth: '540px',
          margin: '0 auto 40px',
        }}>
          RaffleTrust runs every draw with a published random seed and an immutable audit log — so participants never have to take the organiser's word for it.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            to={isAuthenticated ? '/browse' : '/register'}
            style={{
              padding: '13px 28px',
              fontSize: '16px',
              fontWeight: 700,
              color: '#FFFFFF',
              backgroundColor: 'var(--brand-primary)',
              textDecoration: 'none',
              borderRadius: '10px',
              display: 'inline-block',
            }}
          >
            {isAuthenticated ? 'Browse raffles' : 'Enter a raffle free'}
          </Link>
          <Link
            to={isAuthenticated && user?.role === 'BUSINESS' ? '/business/dashboard' : '/register/business'}
            style={{
              padding: '13px 28px',
              fontSize: '16px',
              fontWeight: 700,
              color: 'var(--brand-accent)',
              backgroundColor: '#F5F3FF',
              textDecoration: 'none',
              borderRadius: '10px',
              display: 'inline-block',
            }}
          >
            Run a raffle →
          </Link>
        </div>
      </section>

      {/* Stats bar */}
      <section style={{ backgroundColor: 'var(--bg-card)', borderTop: '1px solid var(--border-default)', borderBottom: '1px solid var(--border-default)' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', padding: '40px 24px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          <StatCounter value={stats?.raffles ?? null} label="Raffles hosted" />
          <StatCounter value={stats?.entries ?? null} label="Entries submitted" />
          <StatCounter value={stats?.draws ?? null} label="Draws completed" />
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '52px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: '12px' }}>
            Built on trust, not promises
          </h2>
          <p style={{ fontSize: '16px', color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto', lineHeight: 1.6 }}>
            Every technical decision on this platform is designed to make cheating impossible and verification trivial.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {FEATURES.map((f) => (
            <div key={f.title} style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              borderRadius: '16px',
              padding: '32px',
            }}>
              <div style={{ fontSize: '32px', marginBottom: '16px' }}>{f.icon}</div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>{f.title}</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ backgroundColor: 'var(--bg-card)', borderTop: '1px solid var(--border-default)', borderBottom: '1px solid var(--border-default)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '80px 24px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px', textAlign: 'center', marginBottom: '56px' }}>
            How it works
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px' }}>
            {/* Participant */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>
                  🎟️
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)' }}>For participants</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {HOW_PARTICIPANT.map((item) => (
                  <div key={item.step} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--brand-primary)', color: '#FFFFFF', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {item.step}
                    </div>
                    <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.5, paddingTop: '3px' }}>{item.text}</p>
                  </div>
                ))}
              </div>
              <Link to={isAuthenticated ? '/browse' : '/register/participant'} style={{ display: 'inline-block', marginTop: '28px', fontSize: '14px', fontWeight: 600, color: 'var(--brand-primary)', textDecoration: 'none' }}>
                Browse raffles →
              </Link>
            </div>

            {/* Business */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>
                  🏢
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)' }}>For businesses</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {HOW_BUSINESS.map((item) => (
                  <div key={item.step} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--brand-accent)', color: '#FFFFFF', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {item.step}
                    </div>
                    <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.5, paddingTop: '3px' }}>{item.text}</p>
                  </div>
                ))}
              </div>
              <Link to={isAuthenticated && user?.role === 'BUSINESS' ? '/business/dashboard' : '/register/business'} style={{ display: 'inline-block', marginTop: '28px', fontSize: '14px', fontWeight: 600, color: 'var(--brand-accent)', textDecoration: 'none' }}>
                Start running raffles →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <div style={{
          backgroundColor: 'var(--brand-primary)',
          borderRadius: '20px',
          padding: '64px 40px',
        }}>
          <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.5px', marginBottom: '12px' }}>
            Ready to run a fair raffle?
          </h2>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.8)', marginBottom: '32px', maxWidth: '440px', margin: '0 auto 32px', lineHeight: 1.6 }}>
            Every draw is verified. Every result is public. Every winner is selected fairly.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to={isAuthenticated ? '/browse' : '/register'} style={{ padding: '13px 28px', fontSize: '15px', fontWeight: 700, color: 'var(--brand-primary)', backgroundColor: '#FFFFFF', textDecoration: 'none', borderRadius: '10px', display: 'inline-block' }}>
              {isAuthenticated ? 'Browse raffles' : 'Create free account'}
            </Link>
            <Link to={isAuthenticated && user?.role === 'BUSINESS' ? '/business/dashboard' : '/register/business'} style={{ padding: '13px 28px', fontSize: '15px', fontWeight: 700, color: '#FFFFFF', backgroundColor: 'rgba(255,255,255,0.15)', textDecoration: 'none', borderRadius: '10px', display: 'inline-block', border: '1px solid rgba(255,255,255,0.3)' }}>
              Run a raffle
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-default)', padding: '32px 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--brand-primary)' }}>RaffleTrust</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <Link to="/verify" style={{ fontSize: '13px', color: 'var(--text-secondary)', textDecoration: 'none' }}>Verify a draw</Link>
            <Link to="/browse" style={{ fontSize: '13px', color: 'var(--text-secondary)', textDecoration: 'none' }}>Browse raffles</Link>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
              Final year project — Michael Chinye · Miva Open University · 2026
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
