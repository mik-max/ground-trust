import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { listRaffles } from '../services/raffle.service';
import useAuthStore from '../store/auth.store';
import type { Raffle, RaffleStatus } from '../types';

type Filter = 'ALL' | RaffleStatus;

const FILTERS: { label: string; value: Filter }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Ended', value: 'ENDED' },
];

function statusBadge(status: RaffleStatus) {
  const map: Record<RaffleStatus, { label: string; color: string; bg: string }> = {
    ACTIVE: { label: 'Active', color: 'var(--status-success)', bg: '#DCFCE7' },
    ENDED: { label: 'Ended', color: 'var(--text-secondary)', bg: 'var(--bg-track)' },
    DRAFT: { label: 'Draft', color: 'var(--status-warning)', bg: '#FEF3C7' },
    CANCELLED: { label: 'Cancelled', color: 'var(--status-error)', bg: '#FEE2E2' },
  };
  const s = map[status];
  return (
    <span style={{
      fontSize: '11px',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      color: s.color,
      backgroundColor: s.bg,
      padding: '2px 8px',
      borderRadius: '20px',
    }}>
      {s.label}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function RaffleCard({ raffle }: { raffle: Raffle }) {
  const fillPct = raffle.maxParticipants
    ? Math.min(100, Math.round((raffle.entriesCount / raffle.maxParticipants) * 100))
    : null;

  return (
    <Link
      to={`/raffle/${raffle.id}`}
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-default)',
        borderRadius: '12px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        cursor: 'pointer',
        transition: 'box-shadow 0.15s, transform 0.15s',
        height: '100%',
      }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
          (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow = 'none';
          (e.currentTarget as HTMLElement).style.transform = 'none';
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.35, flex: 1 }}>
            {raffle.name}
          </h3>
          {statusBadge(raffle.status)}
        </div>

        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, flex: 1, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {raffle.description}
        </p>

        <div style={{
          backgroundColor: 'var(--bg-page)',
          borderRadius: '8px',
          padding: '10px 12px',
          fontSize: '13px',
          color: 'var(--text-secondary)',
        }}>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Prize: </span>{raffle.prize}
        </div>

        {fillPct !== null && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              <span>{raffle.entriesCount.toLocaleString()} entries</span>
              <span>{raffle.maxParticipants?.toLocaleString()} max</span>
            </div>
            <div style={{ height: '4px', backgroundColor: 'var(--bg-track)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${fillPct}%`,
                backgroundColor: fillPct >= 90 ? 'var(--status-warning)' : 'var(--brand-primary)',
                borderRadius: '2px',
                transition: 'width 0.3s',
              }} />
            </div>
          </div>
        )}

        {fillPct === null && (
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            {raffle.entriesCount.toLocaleString()} entries · Unlimited spots
          </p>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', paddingTop: '4px', borderTop: '1px solid var(--border-default)' }}>
          <span>Draw: {formatDate(raffle.drawDate)}</span>
          <span>{raffle.winnersCount} winner{raffle.winnersCount > 1 ? 's' : ''}</span>
        </div>

        <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
          by {raffle.createdBy.businessName || raffle.createdBy.name}
        </p>
      </div>
    </Link>
  );
}

export default function Browse() {
  const { clearAuth } = useAuthStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [filter, setFilter] = useState<Filter>('ALL');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const fetchRaffles = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await listRaffles({ status: filter, search: debouncedSearch, page, limit: 12 });
      setRaffles(data.data);
      setTotal(data.meta.total);
      setTotalPages(data.meta.totalPages);
    } catch {
      setError('Failed to load raffles. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [filter, debouncedSearch, page]);

  useEffect(() => {
    fetchRaffles();
  }, [fetchRaffles]);

  useEffect(() => {
    setPage(1);
  }, [filter, debouncedSearch]);

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-page)' }}>

      {/* Nav */}
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
          <Link to="/browse" style={{ fontSize: '14px', fontWeight: 500, color: 'var(--brand-primary)', textDecoration: 'none' }}>
            Browse
          </Link>
          {user?.role === 'PARTICIPANT' && (
            <Link to="/dashboard" style={{ fontSize: '14px', color: 'var(--text-secondary)', textDecoration: 'none' }}>
              My Entries
            </Link>
          )}
          {user?.role === 'BUSINESS' && (
            <Link to="/business/dashboard" style={{ fontSize: '14px', color: 'var(--text-secondary)', textDecoration: 'none' }}>
              Dashboard
            </Link>
          )}
          <button
            onClick={handleLogout}
            style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              background: 'none',
              border: '1px solid var(--border-default)',
              borderRadius: '6px',
              padding: '5px 12px',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
            }}
          >
            Log out
          </button>
        </nav>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>

        {/* Hero text */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Browse Raffles
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>
            Every draw is auditable — see exactly how winners are selected.
          </p>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '28px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search raffles…"
            style={{
              flex: '1',
              minWidth: '200px',
              padding: '9px 14px',
              fontSize: '14px',
              border: '1px solid var(--border-default)',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-primary)',
              outline: 'none',
              fontFamily: 'var(--font-sans)',
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--brand-primary)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border-default)')}
          />

          {/* Filter pills */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: filter === f.value ? 600 : 400,
                  color: filter === f.value ? '#FFFFFF' : 'var(--text-secondary)',
                  backgroundColor: filter === f.value ? 'var(--brand-primary)' : 'var(--bg-card)',
                  border: '1px solid',
                  borderColor: filter === f.value ? 'var(--brand-primary)' : 'var(--border-default)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
                  transition: 'all 0.15s',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        {!loading && (
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            {total === 0 ? 'No raffles found' : `${total} raffle${total !== 1 ? 's' : ''} found`}
          </p>
        )}

        {/* Error */}
        {error && (
          <div style={{
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: '8px',
            padding: '14px 16px',
            marginBottom: '24px',
            fontSize: '14px',
            color: 'var(--status-error)',
          }}>
            {error}
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-default)',
                borderRadius: '12px',
                padding: '24px',
                height: '260px',
                background: 'linear-gradient(90deg, var(--bg-card) 25%, var(--bg-track) 50%, var(--bg-card) 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.4s infinite',
              }} />
            ))}
          </div>
        ) : raffles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--text-secondary)' }}>
            <p style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
              No raffles found
            </p>
            <p style={{ fontSize: '14px' }}>
              {debouncedSearch ? 'Try a different search term.' : 'Check back later for new giveaways.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {raffles.map((r) => (
              <RaffleCard key={r.id} raffle={r} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && !loading && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '40px' }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                border: '1px solid var(--border-default)',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-card)',
                color: page === 1 ? 'var(--text-secondary)' : 'var(--text-primary)',
                cursor: page === 1 ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-sans)',
              }}
            >
              Previous
            </button>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                border: '1px solid var(--border-default)',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-card)',
                color: page === totalPages ? 'var(--text-secondary)' : 'var(--text-primary)',
                cursor: page === totalPages ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-sans)',
              }}
            >
              Next
            </button>
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
