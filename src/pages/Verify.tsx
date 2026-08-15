import { useState, useEffect, type FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { verifyDraw, type VerifyResult } from '../services/public.service';
import { AxiosError } from 'axios';

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
  });
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button onClick={copy} style={{ fontSize: '12px', fontWeight: 600, color: copied ? 'var(--status-success)' : 'var(--brand-primary)', background: 'none', border: 'none', cursor: 'pointer', padding: '0', fontFamily: 'var(--font-sans)' }}>
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

function AuditCertificate({ result }: { result: VerifyResult }) {
  const log = result.auditLog!;

  const verificationScript = `// RaffleTrust — Draw Verification Script
// Raffle: ${result.name}
// Executed: ${log.drawExecutedAt}

const seed = "${log.randomSeed}";
const participants = ${log.participantCount}; // participant count at draw time
const winnersCount = ${result.winnersCount};

// Deterministic selection using the published seed
function pickWinners(total, count, seed) {
  const pool = Array.from({ length: total }, (_, i) => i);
  const winners = [];
  let state = BigInt("0x" + seed.slice(0, 16));
  const pick = () => {
    state = (state * 6364136223846793005n + 1442695040888963407n) & 0xFFFFFFFFFFFFFFFFn;
    return Number(state % BigInt(pool.length));
  };
  for (let i = 0; i < Math.min(count, pool.length); i++) {
    const idx = pick() % pool.length;
    winners.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return winners;
}

// Expected winner positions (0-indexed from participant list):
console.log("Winner positions:", pickWinners(participants, winnersCount, seed));
// Published winner IDs: ${JSON.stringify(log.winnerIds)}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Certificate header */}
      <div style={{
        backgroundColor: '#F0FDF4',
        border: '1px solid #BBF7D0',
        borderRadius: '12px',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
      }}>
        <div style={{ fontSize: '28px' }}>✅</div>
        <div>
          <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--status-success)', marginBottom: '2px' }}>
            Draw verified — audit log found
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            This draw was executed on {formatDate(log.drawExecutedAt)}. The record below is append-only and cannot be modified.
          </p>
        </div>
      </div>

      {/* Raffle summary */}
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '12px', padding: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>Raffle</h2>
        <Row label="Name" value={result.name} />
        <Row label="Prize" value={result.prize} />
        <Row label="Draw date" value={formatDate(result.drawDate)} />
        <Row label="Winners" value={`${result.winnersCount}`} last />
      </div>

      {/* Audit log */}
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '12px', padding: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>Audit log</h2>
        <Row label="Draw executed at" value={formatDate(log.drawExecutedAt)} />
        <Row label="Participants at draw time" value={log.participantCount.toLocaleString()} />
        <Row label="Algorithm" value={log.algorithm === 'UNIFORM' ? 'Uniform random (CSPRNG)' : 'Weighted'} />

        <div style={{ padding: '14px 0', borderBottom: '1px solid var(--border-default)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Random seed</span>
            <CopyButton text={log.randomSeed} />
          </div>
          <code style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', wordBreak: 'break-all', display: 'block', backgroundColor: 'var(--bg-page)', padding: '10px 12px', borderRadius: '6px' }}>
            {log.randomSeed}
          </code>
        </div>

        <div style={{ padding: '14px 0' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
            Winner IDs ({log.winnerIds.length})
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {log.winnerIds.map((id, i) => (
              <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'var(--bg-page)', padding: '8px 12px', borderRadius: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--status-success)', backgroundColor: '#DCFCE7', padding: '2px 8px', borderRadius: '20px', flexShrink: 0 }}>
                  #{i + 1}
                </span>
                <code style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', flex: 1, wordBreak: 'break-all' }}>
                  {id}
                </code>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Verification steps */}
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '12px', padding: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>How to verify this result yourself</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.6 }}>
          You don't need to trust RaffleTrust. The seed and algorithm are public — run the script below in any JavaScript environment to confirm the winner positions independently.
        </p>

        {[
          { n: '1', text: `Take the random seed published above.` },
          { n: '2', text: `Apply the UNIFORM CSPRNG algorithm with ${log.participantCount} participants and ${result.winnersCount} winner${result.winnersCount > 1 ? 's' : ''}.` },
          { n: '3', text: `The resulting winner positions must match the Winner IDs listed in the audit log.` },
        ].map((s) => (
          <div key={s.n} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: '14px' }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--brand-primary)', color: '#FFFFFF', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {s.n}
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, paddingTop: '2px' }}>{s.text}</p>
          </div>
        ))}

        <div style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Verification script (JavaScript)</span>
            <CopyButton text={verificationScript} />
          </div>
          <pre style={{
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-primary)',
            backgroundColor: 'var(--bg-page)',
            padding: '16px',
            borderRadius: '8px',
            overflowX: 'auto',
            lineHeight: 1.6,
            margin: 0,
            border: '1px solid var(--border-default)',
          }}>
            {verificationScript}
          </pre>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: last ? 'none' : '1px solid var(--border-default)', gap: '16px' }}>
      <span style={{ fontSize: '13px', color: 'var(--text-secondary)', flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', textAlign: 'right' }}>{value}</span>
    </div>
  );
}

export default function Verify() {
  const { id: urlId } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const [input, setInput] = useState(urlId ?? '');
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const lookup = async (id: string) => {
    if (!id.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const { data } = await verifyDraw(id.trim());
      setResult(data);
      if (id.trim() !== urlId) navigate(`/verify/${id.trim()}`, { replace: true });
    } catch (err) {
      const axiosErr = err as AxiosError<{ message: string }>;
      setError(axiosErr.response?.status === 404 ? 'No raffle found with that ID.' : 'Lookup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (urlId) lookup(urlId);
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    lookup(input);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-page)' }}>

      {/* Nav */}
      <header style={{ backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border-default)', padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--brand-primary)', letterSpacing: '-0.5px' }}>RaffleTrust</span>
        </Link>
        <nav style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Link to="/browse" style={{ fontSize: '14px', color: 'var(--text-secondary)', textDecoration: 'none' }}>Browse</Link>
          <Link to="/login" style={{ fontSize: '14px', color: 'var(--text-secondary)', textDecoration: 'none' }}>Log in</Link>
        </nav>
      </header>

      <main style={{ maxWidth: '720px', margin: '0 auto', padding: '48px 24px' }}>

        {/* Page header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: '8px' }}>
            Verify a draw
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Enter a raffle ID to inspect its audit log and independently confirm the draw result — no account required.
          </p>
        </div>

        {/* Search form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '32px' }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste raffle ID here…"
            style={{
              flex: 1,
              padding: '11px 14px',
              fontSize: '14px',
              border: '1px solid var(--border-default)',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-primary)',
              outline: 'none',
              fontFamily: 'var(--font-mono)',
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--brand-primary)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border-default)')}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            style={{
              padding: '11px 22px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#FFFFFF',
              backgroundColor: loading || !input.trim() ? 'var(--text-secondary)' : 'var(--brand-primary)',
              border: 'none',
              borderRadius: '8px',
              cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-sans)',
              flexShrink: 0,
            }}
          >
            {loading ? 'Looking up…' : 'Verify'}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '14px 16px', marginBottom: '24px', fontSize: '14px', color: 'var(--status-error)' }}>
            {error}
          </div>
        )}

        {/* Result */}
        {result && !result.auditLog && (
          <div style={{ backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '12px', padding: '20px 24px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '24px' }}>⏳</span>
            <div>
              <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--status-warning)', marginBottom: '4px' }}>Draw not yet executed</p>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                <strong style={{ color: 'var(--text-primary)' }}>{result.name}</strong> is still active. The audit log will appear here as soon as the draw runs.
              </p>
            </div>
          </div>
        )}

        {result?.auditLog && <AuditCertificate result={result} />}

        {/* Empty state hint */}
        {!result && !error && !loading && (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-secondary)' }}>
            <p style={{ fontSize: '14px', lineHeight: 1.7 }}>
              You can find a raffle's ID in its URL on the{' '}
              <Link to="/browse" style={{ color: 'var(--brand-primary)', textDecoration: 'none', fontWeight: 500 }}>Browse page</Link>
              , or the organiser can share a direct link like:<br />
              <code style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-primary)' }}>
                raffletrust.app/verify/{'<raffle-id>'}
              </code>
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
