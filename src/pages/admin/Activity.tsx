import { useEffect, useState } from "react";
import { getActivity, type ActivitySummary } from "../../services/admin.service";
import { BackLink } from "../../components/ui/BackLink";
import { Card } from "../../components/ui/Card";
import { Skeleton } from "../../components/ui/Skeleton";
import { text } from "../../styles/typography";

const PERIODS = [
  { days: 1, label: "Today" },
  { days: 7, label: "7 days" },
  { days: 30, label: "30 days" },
] as const;

// Plain-words labels for the feed.
const EVENT_LABEL: Record<string, string> = {
  signup: "Signed up",
  login: "Logged in",
  login_failed: "Failed login",
  password_reset_requested: "Asked for a password reset",
  password_reset_completed: "Reset their password",
  review_submitted: "Submitted a review",
  review_reported: "Reported a review",
  photo_uploaded: "Added a photo",
  area_proposed: "Proposed a new area",
  flag_responded: "Responded to a flag",
  search: "Searched",
  share_opened: "Opened Share",
  share_whatsapp: "Shared to WhatsApp",
  share_save_image: "Saved a share image",
  share_copy_link: "Copied a share link",
  admin_review_moderated: "Moderated a review",
  admin_report_resolved: "Resolved a report",
  admin_area_moderated: "Moderated an area",
  admin_photo_approved: "Approved a photo",
  admin_photo_rejected: "Rejected a photo",
  admin_government_account_created: "Created a government account",
};
const ATTENTION = new Set(["login_failed", "review_reported"]);

const fmt = (n: number) => n.toLocaleString();
const when = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

function detail(e: ActivitySummary["recent"][number]): string {
  const m = e.meta ?? {};
  const bits = [
    e.user ? `${e.user}${e.role && e.role !== "resident" ? ` (${e.role})` : ""}` : e.role ? e.role : "Visitor",
    e.area,
    typeof m.query === "string" ? `“${m.query}”` : null,
    typeof m.email === "string" ? String(m.email) : null,
    typeof m.reason === "string" ? String(m.reason).replace(/_/g, " ") : null,
    typeof m.decision === "string" ? String(m.decision) : null,
    typeof m.method === "string" && m.method === "google" ? "with Google" : null,
    typeof m.status === "string" && e.type === "review_submitted" ? (m.status === "approved" ? "published" : "held for review") : null,
  ];
  return bits.filter(Boolean).join(" · ");
}

export function Activity() {
  const [days, setDays] = useState(7);
  const [data, setData] = useState<ActivitySummary | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let live = true;
    const load = () =>
      getActivity(days)
        .then((d) => live && (setData(d), setError(false)))
        .catch(() => live && setError(true));
    setData(null);
    load();
    const timer = setInterval(load, 30_000);
    return () => {
      live = false;
      clearInterval(timer);
    };
  }, [days]);

  const t = data?.totals;
  const errorRate = t && t.apiRequests ? (t.apiServerErrors / t.apiRequests) * 100 : 0;

  return (
    <div className="flex flex-col gap-6">
      <BackLink to="/" label="All areas" />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className={text.displayMd}>Activity</h1>
          <p className="text-body text-mute">What's happening on GroundTrust. Refreshes every 30 seconds.</p>
        </div>
        <div role="tablist" aria-label="Period" className="inline-flex rounded-full bg-paper-2 p-1">
          {PERIODS.map((p) => (
            <button
              key={p.days}
              type="button"
              role="tab"
              aria-selected={days === p.days}
              onClick={() => setDays(p.days)}
              className={`rounded-full px-4 py-1.5 text-body transition-all ${
                days === p.days ? "bg-white font-medium text-ink shadow-[0_1px_3px_rgba(17,23,21,.12)]" : "text-mute hover:text-ink"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-body text-band-poor">Couldn't load activity. It will try again shortly.</p>}

      {!t ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Tile label="Visitors" value={fmt(t.visitors)} note={`${fmt(t.pageViews)} page views`} />
            <Tile label="Sign-ups" value={fmt(t.signups)} note={`${fmt(t.logins)} logins`} />
            <Tile label="Reviews" value={fmt(t.reviews)} note={`${fmt(t.photos)} photos added`} />
            <Tile label="Shares" value={fmt(t.shares)} note={`${fmt(t.shareActions)} sent, saved or copied`} />
            <Tile label="Searches" value={fmt(t.searches)} />
            <Tile label="Failed logins" value={fmt(t.failedLogins)} attention={t.failedLogins > 0} note={`${fmt(t.passwordResets)} reset requests`} />
            <Tile label="Reports" value={fmt(t.reports)} attention={t.reports > 0} note="reviews flagged by readers" />
            <Tile
              label="API"
              value={fmt(t.apiRequests)}
              attention={errorRate >= 1}
              note={`${errorRate.toFixed(errorRate && errorRate < 1 ? 2 : 1)}% server errors · ${t.apiAvgMs} ms avg`}
            />
          </div>

          {days > 1 && (
            <Card>
              <p className={text.heading}>Visitors per day</p>
              <DailyChart rows={fillDays(data!.daily, days)} />
            </Card>
          )}

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <ListCard title="Most-viewed areas" empty="No area pages viewed yet." rows={data!.topAreas.map((a) => [a.name, `${fmt(a.views)} views · ${fmt(a.visitors)} visitors`])} />
            <ListCard title="Top searches" empty="No searches yet." rows={data!.topSearches.map((s) => [s.query, `${fmt(s.times)}×`])} />
            <ListCard title="Top pages" empty="No page views yet." rows={data!.topPages.map((p) => [p.page, fmt(p.views)])} />
          </div>

          <Card padding="none" className="overflow-hidden">
            <p className={`${text.heading} px-6 pt-5`}>API health</p>
            {data!.api.length === 0 ? (
              <p className="px-6 pb-5 pt-2 text-body text-mute">No API traffic recorded for this period yet (it's saved once a minute).</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="mt-3 w-full min-w-[640px] text-body">
                  <thead>
                    <tr className="border-y border-line text-left text-caption text-mute">
                      <th className="px-6 py-2 font-medium">Endpoint</th>
                      <th className="px-3 py-2 text-right font-medium">Requests</th>
                      <th className="px-3 py-2 text-right font-medium">Client errors</th>
                      <th className="px-3 py-2 text-right font-medium">Server errors</th>
                      <th className="px-3 py-2 text-right font-medium">Avg</th>
                      <th className="px-6 py-2 text-right font-medium">Slowest</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data!.api.map((r) => (
                      <tr key={r.method + r.route} className="border-b border-line last:border-0">
                        <td className="px-6 py-2.5 font-mono text-caption text-ink">
                          <span className="mr-2 text-mute">{r.method}</span>
                          {r.route}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums">{fmt(r.requests)}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-mute">{fmt(r.clientErrors)}</td>
                        <td className={`px-3 py-2.5 text-right tabular-nums ${r.serverErrors ? "font-medium text-band-poor" : "text-mute"}`}>
                          {fmt(r.serverErrors)}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums">{r.avgMs} ms</td>
                        <td className="px-6 py-2.5 text-right tabular-nums text-mute">{fmt(r.maxMs)} ms</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <Card padding="none" className="overflow-hidden">
            <p className={`${text.heading} px-6 pt-5`}>Recent activity</p>
            {data!.recent.length === 0 ? (
              <p className="px-6 pb-5 pt-2 text-body text-mute">Nothing yet for this period. Sign-ups, reviews, shares and logins will appear here.</p>
            ) : (
              <ul className="mt-3">
                {data!.recent.map((e) => (
                  <li key={e.id} className="flex items-start gap-3 border-t border-line px-6 py-3">
                    <span
                      className={`mt-2 h-2 w-2 shrink-0 rounded-full ${ATTENTION.has(e.type) ? "bg-band-poor" : e.type.startsWith("admin_") ? "bg-faint" : "bg-brand"}`}
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-body text-ink">
                        {EVENT_LABEL[e.type] ?? e.type}
                        {ATTENTION.has(e.type) && <span className="sr-only"> (needs attention)</span>}
                      </p>
                      <p className="truncate text-caption text-mute">{detail(e)}</p>
                    </div>
                    <span className="shrink-0 text-caption tabular-nums text-mute">{when(e.at)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </>
      )}
    </div>
  );
}

function Tile({ label, value, note, attention = false }: { label: string; value: string; note?: string; attention?: boolean }) {
  return (
    <Card padding="sm" className="flex flex-col gap-1">
      <p className="text-caption text-mute">{label}</p>
      <p className={`text-data-lg tabular-nums ${attention ? "text-band-poor" : "text-ink"}`}>{value}</p>
      {note && <p className="text-caption text-mute">{note}</p>}
    </Card>
  );
}

function ListCard({ title, rows, empty }: { title: string; rows: [string, string][]; empty: string }) {
  return (
    <Card padding="none" className="overflow-hidden">
      <p className={`${text.heading} px-5 pt-4`}>{title}</p>
      {rows.length === 0 ? (
        <p className="px-5 pb-4 pt-2 text-body text-mute">{empty}</p>
      ) : (
        <ul className="mt-2">
          {rows.map(([name, value]) => (
            <li key={name} className="flex items-baseline justify-between gap-3 border-t border-line px-5 py-2.5 text-body">
              <span className="min-w-0 truncate text-ink">{name}</span>
              <span className="shrink-0 text-caption tabular-nums text-mute">{value}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

// Every day in the period, in Lagos time, with quiet days as zero rather than missing.
function fillDays(rows: ActivitySummary["daily"], days: number): ActivitySummary["daily"] {
  const byDay = new Map(rows.map((r) => [r.day, r]));
  const lagosToday = new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 10);
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(`${lagosToday}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() - (days - 1 - i));
    const day = d.toISOString().slice(0, 10);
    return byDay.get(day) ?? { day, visitors: 0, pageViews: 0, signups: 0, reviews: 0 };
  });
}

// Visitors per day: one series, so no legend; hover a bar for that day's details.
function DailyChart({ rows }: { rows: ActivitySummary["daily"] }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 720, H = 200, padL = 36, padR = 8, padT = 12, padB = 26;
  const max = Math.max(1, ...rows.map((r) => r.visitors));
  const step = Math.max(1, Math.ceil(max / 4));
  const ticks = Array.from({ length: Math.floor(max / step) + 1 }, (_, i) => i * step);
  const top = ticks.at(-1)! < max ? max : ticks.at(-1)!;
  const bw = (W - padL - padR) / rows.length;
  const y = (v: number) => padT + (H - padT - padB) * (1 - v / top);
  const label = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString(undefined, { day: "numeric", month: "short" });
  const every = Math.ceil(rows.length / 8);
  const h = hover === null ? null : rows[hover];

  return (
    <div className="relative mt-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Visitors per day">
        {ticks.map((v) => (
          <g key={v}>
            <line x1={padL} x2={W - padR} y1={y(v)} y2={y(v)} stroke="var(--color-line)" strokeWidth="1" />
            <text x={padL - 8} y={y(v) + 4} textAnchor="end" fontSize="11" fill="var(--color-mute)">{v}</text>
          </g>
        ))}
        {rows.map((r, i) => {
          const x = padL + i * bw;
          const bh = H - padB - y(r.visitors);
          return (
            <g key={r.day} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              <rect x={x} y={padT} width={bw} height={H - padT - padB} fill="transparent" />
              {r.visitors > 0 && (
                <path
                  d={`M${x + bw * 0.18} ${H - padB}V${y(r.visitors) + 4}q0 -4 4 -4h${bw * 0.64 - 8}q4 0 4 4V${H - padB}z`}
                  fill="var(--color-brand)"
                  opacity={hover === null || hover === i ? 1 : 0.45}
                />
              )}
              {bh <= 0 && <line x1={x + bw * 0.18} x2={x + bw * 0.82} y1={H - padB} y2={H - padB} stroke="var(--color-faint)" strokeWidth="2" />}
              {i % every === 0 && (
                <text x={x + bw / 2} y={H - 8} textAnchor="middle" fontSize="11" fill="var(--color-mute)">{label(r.day)}</text>
              )}
            </g>
          );
        })}
      </svg>
      {h && (
        <div
          className="pointer-events-none absolute top-0 z-10 whitespace-nowrap rounded-md border border-line bg-white px-3 py-2 text-caption shadow-raised"
          style={{ left: `clamp(0px, calc(${((hover! + 0.5) / rows.length) * 100}% - 70px), calc(100% - 190px))` }}
        >
          <p className="font-medium text-ink">{label(h.day)}</p>
          <p className="text-mute">{h.visitors} visitors · {h.pageViews} page views</p>
          <p className="text-mute">{h.signups} sign-ups · {h.reviews} reviews</p>
        </div>
      )}
    </div>
  );
}
