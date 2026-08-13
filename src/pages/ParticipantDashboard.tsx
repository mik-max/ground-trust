import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyEntries, type MyEntry } from '../services/entry.service';
import useAuthStore from '../store/auth.store';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function EntryCard({ entry }: { entry: MyEntry }) {
  const isEnded = entry.raffle.status === 'ENDED';
  const isPending = entry.raffle.status === 'ACTIVE';

  return (
    <Link to={`/raffle/${entry.raffle.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid',
        borderColor: entry.won ? '#BBF7D0' : 'var(--border-default)',
        borderRadius: '12px',
        padding: '20px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
        transition: 'box-shadow 0.15s',
      }}
        onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.07)'}
        onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.boxShadow = 'none'}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {entry.raffle.name}
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Prize: {entry.raffle.prize}
          </p>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Entered {formatDate(entry.createdAt)} · Draw {formatDate(entry.raffle.drawDate)}
          </p>
        </div>

        <div style={{ flexShrink: 0, textAlign: 'right' }}>
          {entry.won && (
            <span style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--status-success)',
              backgroundColor: '#DCFCE7',
              padding: '3px 10px',
              borderRadius: '20px',
              marginBottom: '4px',
            }}>
              Winner!
            </span>
          )}
          {!entry.won && isEnded && (
            <span style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              backgroundColor: 'var(--bg-track)',
              padding: '3px 10px',
              borderRadius: '20px',
              marginBottom: '4px',
            }}>
              Not selected
            </span>
          )}
          {isPending && (
            <span style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--brand-primary)',
              backgroundColor: '#EFF6FF',
              padding: '3px 10px',
              borderRadius: '20px',
              marginBottom: '4px',
            }}>
              Pending draw
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function ParticipantDashboard() {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const [entries, setEntries] = useState<MyEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getMyEntries();
        setEntries(data.data);
      } catch {
        // silently fail — empty state covers this
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const wins = entries.filter((e) => e.won).length;
  const pending = entries.filter((e) => e.raffle.status === 'ACTIVE').length;

  const handleLogout = () => { clearAuth(); navigate('/login'); };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-page)' }}>

      <header style={{
        backgroundColor: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-default)',
        padding: '0 24px',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--brand-primary)', letterSpacing: '-0.5px' }}>
            RaffleTrust
          </span>
        </Link>
        <nav style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to="/browse" style={{ fontSize: '14px', color: 'var(--text-secondary)', textDecoration: 'none' }}>Browse</Link>
          <Link to="/dashboard" style={{ fontSize: '14px', fontWeight: 500, color: 'var(--brand-primary)', textDecoration: 'none' }}>My Entries</Link>
          <button onClick={handleLogout} style={{ fontSize: '14px', color: 'var(--text-secondary)', background: 'none', border: '1px solid var(--border-default)', borderRadius: '6px', padding: '5px 12px', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
            Log out
          </button>
        </nav>
      </header>

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px' }}>

        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
            My Entries
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Welcome back, {user?.name}
          </p>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
          {[
            { label: 'Total entries', value: entries.length },
            { label: 'Pending draws', value: pending },
            { label: 'Wins', value: wins },
          ].map((s) => (
            <div key={s.label} style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center',
            }}>
              <p style={{ fontSize: '28px', fontWeight: 700, color: s.label === 'Wins' && wins > 0 ? 'var(--status-success)' : 'var(--brand-primary)', marginBottom: '4px' }}>
                {s.value}
              </p>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{
                height: '88px',
                borderRadius: '12px',
                background: 'linear-gradient(90deg, var(--bg-card) 25%, var(--bg-track) 50%, var(--bg-card) 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.4s infinite',
              }} />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <p style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
              No entries yet
            </p>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Browse active raffles and enter for a chance to win.
            </p>
            <Link to="/browse" style={{
              display: 'inline-block',
              padding: '10px 24px',
              backgroundColor: 'var(--brand-primary)',
              color: '#FFFFFF',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 600,
            }}>
              Browse Raffles
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {entries.map((e) => <EntryCard key={e.id} entry={e} />)}
          </div>
        )}
      </main>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
