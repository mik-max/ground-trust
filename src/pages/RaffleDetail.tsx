import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getRaffle } from '../services/raffle.service';
import { enterRaffle, getMyEntry } from '../services/entry.service';
import useAuthStore from '../store/auth.store';
import type { RaffleDetail as RaffleDetailType, RaffleStatus } from '../types';
import { AxiosError } from 'axios';
import type { ApiError } from '../types';

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
      fontSize: '12px',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      color: s.color,
      backgroundColor: s.bg,
      padding: '3px 10px',
      borderRadius: '20px',
    }}>
      {s.label}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
  });
}

function InfoRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border-default)' }}>
      <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{value}</span>
    </div>
  );
}

export default function RaffleDetail() {
  const { id } = useParams<{ id: string }>();
  const { clearAuth } = useAuthStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [raffle, setRaffle] = useState<RaffleDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [entered, setEntered] = useState(false);
  const [entering, setEntering] = useState(false);
  const [enterError, setEnterError] = useState('');

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const [raffleRes, entryRes] = await Promise.all([getRaffle(id), getMyEntry(id)]);
        setRaffle(raffleRes.data);
        setEntered(!!entryRes.data.entry);
      } catch {
        setError('Raffle not found or unavailable.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleEnter = async () => {
    if (!id) return;
    setEntering(true);
    setEnterError('');
    try {
      await enterRaffle(id);
      setEntered(true);
      setRaffle((prev) => prev ? { ...prev, entriesCount: prev.entriesCount + 1 } : prev);
    } catch (err) {
      const axiosErr = err as AxiosError<ApiError>;
      setEnterError(axiosErr.response?.data?.message || 'Failed to enter raffle. Please try again.');
    } finally {
      setEntering(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const fillPct = raffle?.maxParticipants
    ? Math.min(100, Math.round((raffle.entriesCount / raffle.maxParticipants) * 100))
    : null;

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
          <Link to="/browse" style={{ fontSize: '14px', color: 'var(--text-secondary)', textDecoration: 'none' }}>
            Browse
          </Link>
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

      <main style={{ maxWidth: '840px', margin: '0 auto', padding: '40px 24px' }}>

        {/* Back link */}
        <Link
          to="/browse"
          style={{ fontSize: '14px', color: 'var(--brand-primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '24px' }}
        >
          ← Back to Browse
        </Link>

        {loading && (
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            borderRadius: '12px',
            padding: '40px',
            height: '400px',
            background: 'linear-gradient(90deg, var(--bg-card) 25%, var(--bg-track) 50%, var(--bg-card) 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.4s infinite',
          }} />
        )}

        {error && (
          <div style={{
            textAlign: 'center',
            padding: '80px 24px',
            color: 'var(--text-secondary)',
          }}>
            <p style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Raffle not found
            </p>
            <p style={{ fontSize: '14px', marginBottom: '24px' }}>{error}</p>
            <Link to="/browse" style={{ color: 'var(--brand-primary)', fontSize: '14px' }}>
              Back to Browse
            </Link>
          </div>
        )}

        {raffle && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Header card */}
            <div style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              borderRadius: '12px',
              padding: '32px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3, flex: 1 }}>
                  {raffle.name}
                </h1>
                {statusBadge(raffle.status)}
              </div>

              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                by {raffle.createdBy.businessName || raffle.createdBy.name}
              </p>

              <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '24px' }}>
                {raffle.description}
              </p>

              {/* Prize highlight */}
              <div style={{
                backgroundColor: 'var(--bg-page)',
                border: '1px solid var(--border-default)',
                borderRadius: '10px',
                padding: '16px 20px',
                marginBottom: '24px',
              }}>
                <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Prize
                </p>
                <p style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {raffle.prize}
                </p>
              </div>

              {/* Progress bar */}
              {fillPct !== null && (
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    <span><strong style={{ color: 'var(--text-primary)' }}>{raffle.entriesCount.toLocaleString()}</strong> entries</span>
                    <span>{raffle.maxParticipants?.toLocaleString()} max · {fillPct}% full</span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: 'var(--bg-track)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${fillPct}%`,
                      backgroundColor: fillPct >= 90 ? 'var(--status-warning)' : 'var(--brand-primary)',
                      borderRadius: '3px',
                    }} />
                  </div>
                </div>
              )}

              {fillPct === null && (
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>{raffle.entriesCount.toLocaleString()}</strong> entries · No entry limit
                </p>
              )}

              {/* Enter CTA */}
              {raffle.status === 'ACTIVE' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {enterError && (
                    <div style={{
                      backgroundColor: '#FEF2F2',
                      border: '1px solid #FECACA',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      fontSize: '14px',
                      color: 'var(--status-error)',
                    }}>
                      {enterError}
                    </div>
                  )}
                  {entered ? (
                    <div style={{
                      backgroundColor: '#F0FDF4',
                      border: '1px solid #BBF7D0',
                      borderRadius: '8px',
                      padding: '13px',
                      textAlign: 'center',
                      fontSize: '15px',
                      fontWeight: 600,
                      color: 'var(--status-success)',
                    }}>
                      You're entered — good luck!
                    </div>
                  ) : (
                    <button
                      disabled={entering}
                      onClick={handleEnter}
                      style={{
                        width: '100%',
                        padding: '13px',
                        fontSize: '16px',
                        fontWeight: 600,
                        color: '#FFFFFF',
                        backgroundColor: entering ? 'var(--text-secondary)' : 'var(--brand-primary)',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: entering ? 'not-allowed' : 'pointer',
                        fontFamily: 'var(--font-sans)',
                      }}
                    >
                      {entering ? 'Entering…' : 'Enter This Raffle'}
                    </button>
                  )}
                </div>
              )}

              {raffle.status === 'ENDED' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ backgroundColor: 'var(--bg-track)', borderRadius: '8px', padding: '13px', textAlign: 'center', fontSize: '15px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                    This raffle has ended
                  </div>
                  <Link to={`/verify/${raffle.id}`} style={{ textAlign: 'center', fontSize: '13px', color: 'var(--brand-primary)', textDecoration: 'none', fontWeight: 500 }}>
                    Verify the draw result →
                  </Link>
                </div>
              )}
            </div>

            {/* Details card */}
            <div style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              borderRadius: '12px',
              padding: '24px 28px',
            }}>
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Draw Details
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                All draws on RaffleTrust are cryptographically fair and independently verifiable.
              </p>

              <InfoRow label="Start date" value={formatDate(raffle.startDate)} />
              <InfoRow label="Entry deadline" value={formatDate(raffle.endDate)} />
              <InfoRow label="Draw date" value={formatDate(raffle.drawDate)} />
              <InfoRow label="Number of winners" value={raffle.winnersCount} />
              <InfoRow label="Draw algorithm" value={raffle.algorithm === 'UNIFORM' ? 'Uniform random (CSPRNG)' : 'Weighted'} />
              {raffle.maxParticipants && (
                <InfoRow label="Max participants" value={raffle.maxParticipants.toLocaleString()} />
              )}
            </div>

            {/* Audit log card */}
            {raffle.auditLog ? (
              <div style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-default)',
                borderRadius: '12px',
                padding: '24px 28px',
              }}>
                <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  Audit Log
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  This draw has been completed. The record below is append-only and tamper-evident.
                </p>

                <InfoRow label="Draw executed at" value={formatDate(raffle.auditLog.drawExecutedAt)} />
                <InfoRow label="Total participants at draw time" value={raffle.auditLog.participantCount.toLocaleString()} />
                <InfoRow label="Algorithm used" value={raffle.auditLog.algorithm} />

                <div style={{ padding: '12px 0', borderBottom: '1px solid var(--border-default)' }}>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Random seed</p>
                  <code style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', wordBreak: 'break-all' }}>
                    {raffle.auditLog.randomSeed}
                  </code>
                </div>

                <div style={{ padding: '12px 0' }}>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    Winner IDs ({raffle.auditLog.winnerIds.length})
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {raffle.auditLog.winnerIds.map((wid, i) => (
                      <code key={wid} style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                        #{i + 1}: {wid}
                      </code>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-default)',
                borderRadius: '12px',
                padding: '24px 28px',
              }}>
                <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  Audit Log
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  The audit log will be published here immediately after the draw is executed. Every participant can verify the outcome using the published seed and algorithm.
                </p>
              </div>
            )}
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
