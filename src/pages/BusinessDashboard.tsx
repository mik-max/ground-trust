import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyRaffles, createRaffle, type CreateRafflePayload } from '../services/business.service';
import { executeDraw } from '../services/draw.service';
import useAuthStore from '../store/auth.store';
import type { Raffle } from '../types';
import { AxiosError } from 'axios';
import type { ApiError } from '../types';

type RaffleWithCount = Raffle & { entriesCount: number };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '9px 13px',
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
  fontSize: '13px',
  fontWeight: 500,
  color: 'var(--text-primary)',
  marginBottom: '5px',
};

function statusColor(status: string): { color: string; bg: string } {
  if (status === 'ACTIVE') return { color: 'var(--status-success)', bg: '#DCFCE7' };
  if (status === 'ENDED') return { color: 'var(--text-secondary)', bg: 'var(--bg-track)' };
  if (status === 'CANCELLED') return { color: 'var(--status-error)', bg: '#FEE2E2' };
  return { color: 'var(--status-warning)', bg: '#FEF3C7' };
}

function RaffleRow({ raffle, onDraw }: { raffle: RaffleWithCount; onDraw: (id: string) => void }) {
  const { color, bg } = statusColor(raffle.status);
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr auto auto auto auto',
      gap: '16px',
      alignItems: 'center',
      padding: '16px 20px',
      borderBottom: '1px solid var(--border-default)',
    }}>
      <div style={{ minWidth: 0 }}>
        <Link to={`/raffle/${raffle.id}`} style={{ textDecoration: 'none' }}>
          <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {raffle.name}
          </p>
        </Link>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
          Draw {formatDate(raffle.drawDate)}
        </p>
      </div>

      <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color, backgroundColor: bg, padding: '2px 8px', borderRadius: '20px', whiteSpace: 'nowrap' }}>
        {raffle.status}
      </span>

      <span style={{ fontSize: '14px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
        {raffle.entriesCount.toLocaleString()} entries
      </span>

      <span style={{ fontSize: '14px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
        {raffle.winnersCount} winner{raffle.winnersCount > 1 ? 's' : ''}
      </span>

      {raffle.status === 'ACTIVE' ? (
        <button
          onClick={() => onDraw(raffle.id)}
          style={{
            padding: '6px 14px',
            fontSize: '13px',
            fontWeight: 600,
            color: '#FFFFFF',
            backgroundColor: 'var(--brand-accent)',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            whiteSpace: 'nowrap',
          }}
        >
          Run Draw
        </button>
      ) : (
        <span style={{ width: '88px' }} />
      )}
    </div>
  );
}

function DrawConfirmModal({
  raffle,
  onConfirm,
  onCancel,
  loading,
}: {
  raffle: RaffleWithCount;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '24px',
    }}>
      <div style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '440px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
          Run draw for "{raffle.name}"?
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
          This will select {raffle.winnersCount} winner{raffle.winnersCount > 1 ? 's' : ''} from {raffle.entriesCount} entries using a CSPRNG seed. The raffle will be marked as ended and an audit log will be published immediately. This cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            disabled={loading}
            style={{
              padding: '9px 20px', fontSize: '14px', fontWeight: 500,
              color: 'var(--text-secondary)', backgroundColor: 'var(--bg-page)',
              border: '1px solid var(--border-default)', borderRadius: '8px',
              cursor: 'pointer', fontFamily: 'var(--font-sans)',
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              padding: '9px 20px', fontSize: '14px', fontWeight: 600,
              color: '#FFFFFF',
              backgroundColor: loading ? 'var(--text-secondary)' : 'var(--brand-accent)',
              border: 'none', borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-sans)',
            }}
          >
            {loading ? 'Running draw…' : 'Confirm & Run'}
          </button>
        </div>
      </div>
    </div>
  );
}

const EMPTY_FORM: CreateRafflePayload = {
  name: '', description: '', prize: '',
  startDate: '', endDate: '', drawDate: '',
  maxParticipants: null, winnersCount: 1,
};

export default function BusinessDashboard() {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const [raffles, setRaffles] = useState<RaffleWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<CreateRafflePayload>(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [drawTarget, setDrawTarget] = useState<RaffleWithCount | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [drawResult, setDrawResult] = useState<{ winnerIds: string[]; seed: string } | null>(null);

  const loadRaffles = async () => {
    try {
      const { data } = await getMyRaffles();
      setRaffles(data.data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRaffles(); }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      await createRaffle(form);
      setForm(EMPTY_FORM);
      setShowCreate(false);
      await loadRaffles();
    } catch (err) {
      const axiosErr = err as AxiosError<ApiError>;
      setFormError(axiosErr.response?.data?.message || 'Failed to create raffle.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDraw = async () => {
    if (!drawTarget) return;
    setDrawing(true);
    try {
      const { data } = await executeDraw(drawTarget.id);
      setDrawResult({ winnerIds: data.winnerIds, seed: data.randomSeed });
      await loadRaffles();
    } catch (err) {
      const axiosErr = err as AxiosError<ApiError>;
      alert(axiosErr.response?.data?.message || 'Draw failed.');
      setDrawTarget(null);
    } finally {
      setDrawing(false);
    }
  };

  const set = (field: keyof CreateRafflePayload, value: string | number | null) =>
    setForm((f) => ({ ...f, [field]: value }));

  const active = raffles.filter((r) => r.status === 'ACTIVE').length;
  const totalEntries = raffles.reduce((sum, r) => sum + r.entriesCount, 0);

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
          <Link to="/business/dashboard" style={{ fontSize: '14px', fontWeight: 500, color: 'var(--brand-primary)', textDecoration: 'none' }}>Dashboard</Link>
          <button onClick={handleLogout} style={{ fontSize: '14px', color: 'var(--text-secondary)', background: 'none', border: '1px solid var(--border-default)', borderRadius: '6px', padding: '5px 12px', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
            Log out
          </button>
        </nav>
      </header>

      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 24px' }}>

        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              {user?.businessName || 'Business Dashboard'}
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{user?.email}</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#FFFFFF',
              backgroundColor: 'var(--brand-primary)',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
            }}
          >
            + Create Raffle
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
          {[
            { label: 'Total raffles', value: raffles.length },
            { label: 'Active raffles', value: active },
            { label: 'Total entries', value: totalEntries.toLocaleString() },
          ].map((s) => (
            <div key={s.label} style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
              <p style={{ fontSize: '28px', fontWeight: 700, color: 'var(--brand-primary)', marginBottom: '4px' }}>{s.value}</p>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Raffle table */}
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-default)' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>Your Raffles</h2>
          </div>

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>
              Loading…
            </div>
          ) : raffles.length === 0 ? (
            <div style={{ padding: '60px 24px', textAlign: 'center' }}>
              <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>No raffles yet</p>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Create your first raffle to get started.</p>
            </div>
          ) : (
            raffles.map((r) => (
              <RaffleRow key={r.id} raffle={r} onDraw={(id) => setDrawTarget(raffles.find((x) => x.id === id)!)} />
            ))
          )}
        </div>
      </main>

      {/* Create raffle modal */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '24px' }}>
          <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', padding: '32px', maxWidth: '540px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '24px' }}>Create New Raffle</h2>

            {formError && (
              <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '14px', color: 'var(--status-error)' }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Raffle name</label>
                <input required value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. MacBook Pro Giveaway" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Description</label>
                <textarea required value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Describe the raffle and prize details…" rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
              <div>
                <label style={labelStyle}>Prize</label>
                <input required value={form.prize} onChange={(e) => set('prize', e.target.value)} placeholder="e.g. MacBook Pro M4 (16GB)" style={inputStyle} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Start date</label>
                  <input required type="datetime-local" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Entry deadline</label>
                  <input required type="datetime-local" value={form.endDate} onChange={(e) => set('endDate', e.target.value)} style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Draw date</label>
                  <input required type="datetime-local" value={form.drawDate} onChange={(e) => set('drawDate', e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Winners count</label>
                  <input required type="number" min={1} max={100} value={form.winnersCount} onChange={(e) => set('winnersCount', Number(e.target.value))} style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Max participants (leave blank for unlimited)</label>
                <input type="number" min={1} value={form.maxParticipants ?? ''} onChange={(e) => set('maxParticipants', e.target.value ? Number(e.target.value) : null)} placeholder="No limit" style={inputStyle} />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button type="button" onClick={() => { setShowCreate(false); setForm(EMPTY_FORM); setFormError(''); }} style={{ padding: '9px 20px', fontSize: '14px', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-page)', border: '1px solid var(--border-default)', borderRadius: '8px', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} style={{ padding: '9px 20px', fontSize: '14px', fontWeight: 600, color: '#FFFFFF', backgroundColor: submitting ? 'var(--text-secondary)' : 'var(--brand-primary)', border: 'none', borderRadius: '8px', cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-sans)' }}>
                  {submitting ? 'Creating…' : 'Create Raffle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Draw confirm modal */}
      {drawTarget && !drawResult && (
        <DrawConfirmModal
          raffle={drawTarget}
          onConfirm={handleDraw}
          onCancel={() => setDrawTarget(null)}
          loading={drawing}
        />
      )}

      {/* Draw result modal */}
      {drawResult && drawTarget && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '24px' }}>
          <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', padding: '32px', maxWidth: '480px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Draw complete!</h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              {drawResult.winnerIds.length} winner{drawResult.winnerIds.length > 1 ? 's' : ''} selected for "{drawTarget.name}". The audit log is now publicly visible.
            </p>

            <div style={{ backgroundColor: 'var(--bg-page)', borderRadius: '8px', padding: '14px', marginBottom: '20px' }}>
              <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Winner IDs</p>
              {drawResult.winnerIds.map((id, i) => (
                <code key={id} style={{ display: 'block', fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', marginBottom: '4px' }}>
                  #{i + 1}: {id}
                </code>
              ))}
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '10px' }}>Seed: <code style={{ fontFamily: 'var(--font-mono)', wordBreak: 'break-all' }}>{drawResult.seed.slice(0, 32)}…</code></p>
            </div>

            <button
              onClick={() => { setDrawResult(null); setDrawTarget(null); }}
              style={{ width: '100%', padding: '10px', fontSize: '14px', fontWeight: 600, color: '#FFFFFF', backgroundColor: 'var(--brand-primary)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
