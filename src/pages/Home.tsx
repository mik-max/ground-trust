import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import type { AreaEvidenceStack } from "../types";
import { listAreas } from "../services/area.service";
import { useAuthStore } from "../store/auth.store";
import { AreaCard } from "../components/AreaCard";
import { AreasOverviewMap } from "../components/map/AreasOverviewMap";
import { LocationSearchInput } from "../components/LocationSearchInput";
import { AspectIcon } from "../components/AspectIconChip";
import { ASPECT_META, ASPECT_ORDER } from "../components/aspectMeta";
import { BAND_DOT_CLASS } from "../components/ScoreBandBadge";
import { AreaCardSkeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { buttonClassName } from "../components/ui/Button";
import { text } from "../styles/typography";

const WRAP = "mx-auto w-full max-w-6xl px-5 sm:px-6";

// Home, top to bottom: photo hero with search → what residents rate → areas
// residents are talking about (the live grid, filtered by the search) →
// map → who it's for → why the numbers can be trusted → invitation to
// share. Lagos is mentioned once, as current coverage, not as the brand.
export function Home() {
  const user = useAuthStore((s) => s.user);
  const [query, setQuery] = useState("");
  const [areas, setAreas] = useState<AreaEvidenceStack[]>([]);
  const [loading, setLoading] = useState(true);
  // The hero's most-rated list comes from the unfiltered list and stays put
  // while someone searches.
  const [featured, setFeatured] = useState<AreaEvidenceStack[]>([]);

  // Wait for typing to pause, and ignore answers to searches that have
  // since been replaced, so clearing the field quickly can't leave older
  // results (or a half-updated map) on screen.
  useEffect(() => {
    let current = true;
    setLoading(true);
    const handle = setTimeout(() => {
      listAreas(query.trim() || undefined)
        .then((result) => {
          if (!current) return;
          setAreas(result);
          if (!query.trim()) setFeatured(result);
        })
        .finally(() => {
          if (current) setLoading(false);
        });
    }, query ? 300 : 0);
    return () => {
      current = false;
      clearTimeout(handle);
    };
  }, [query]);

  const searching = query.trim().length > 0;
  // Most-rated first on the default view, so the best-evidenced areas lead.
  const orderedAreas = searching ? areas : [...areas].sort((a, b) => b.overall.N - a.overall.N);
  const shareLink = user?.role === "resident" ? "/share" : "/login";

  return (
    <div className="flex flex-col">
      <Hero query={query} onQueryChange={setQuery} featured={featured} />

      <section className={`${WRAP} pt-24`} aria-labelledby="rate-heading">
        <SectionHead eyebrow="What residents rate" id="rate-heading" title="Five things that shape daily life in an area." />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          {ASPECT_ORDER.map((a, i) => (
            <div
              key={a}
              className={`flex flex-col gap-4 rounded-md border border-line bg-white p-5 ${i === ASPECT_ORDER.length - 1 ? "col-span-2 lg:col-span-1" : ""
                }`}
            >
              <AspectIcon aspect={a} size={48} />
              <div>
                <p className="text-body-lg font-medium text-ink">{ASPECT_META[a].label}</p>
                <p className="text-body text-mute">{ASPECT_META[a].hint}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="areas" className={`${WRAP} scroll-mt-28 pt-24`} aria-labelledby="areas-heading">
        <SectionHead
          eyebrow={searching ? "Search results" : "Areas residents are talking about"}
          id="areas-heading"
          title={
            searching ? (
              <>
                Areas matching “{query.trim()}”
              </>
            ) : (
              <>
                Real scores from real neighbours.{" "}
                <span className="text-faint">Every number shows who stands behind it.</span>
              </>
            )
          }
          action={
            <Link to="/compare" className={buttonClassName({ variant: "outline" })}>
              Compare areas
            </Link>
          }
        />

        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <AreaCardSkeleton key={i} />
            ))}
          </div>
        ) : areas.length === 0 ? (
          searching ? (
            <EmptyState
              illustration="search"
              title={`No area called “${query.trim()}” yet`}
              description="We couldn't find it among the areas we cover. Try a nearby street or landmark, or, if you live there, add it and be the first to rate it."
              action={
                <Link to={shareLink} className={buttonClassName({ variant: "primary" })}>
                  Add it and rate it
                </Link>
              }
            />
          ) : (
            <EmptyState
              illustration="neighbourhood"
              title="No areas have been rated yet"
              description="Ratings from residents will appear here as soon as the first ones come in."
              action={
                <Link to={shareLink} className={buttonClassName({ variant: "primary" })}>
                  Rate your area
                </Link>
              }
            />
          )
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {orderedAreas.map((a) => (
              <AreaCard key={a.area.id} {...a} />
            ))}
          </div>
        )}

        {!loading && areas.length > 0 && (
          <div className="mt-12">
            <h3 className={text.heading}>Browse by map</h3>
            <div className="mt-4 overflow-hidden rounded-lg border border-line bg-white p-2">
              <AreasOverviewMap areas={areas} />
            </div>
          </div>
        )}
      </section>

      <section id="people" className={`${WRAP} scroll-mt-28 pt-24`} aria-labelledby="people-heading">
        <SectionHead
          eyebrow="Who it's for"
          id="people-heading"
          title="Built for the people who choose, live in and look after an area."
        />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Persona
            photo="/images/newcomers.jpg"
            photoLabel="A city district seen from above"
            title="Newcomers"
            who="Renting, buying, opening a shop, or being posted somewhere new."
            points={[
              "See each area's scores with the evidence behind them",
              "Compare two or three areas side by side",
              "No account needed to look",
            ]}
            action={
              <Link to="/compare" className={buttonClassName({ variant: "outline" })}>
                Compare areas
              </Link>
            }
          />
          <Persona
            photo="/images/residents.jpg"
            photoLabel="Two residents looking at a phone together"
            title="Residents"
            who="The people who know what an area is really like."
            points={[
              "Rate only what you know, in about a minute",
              "Speak or type, in English, Yorùbá, Igbo, Hausa or Pidgin",
              "Your rating counts more as you're verified",
            ]}
            action={
              <Link to={shareLink} className={buttonClassName({ variant: "outline" })}>
                Share your experience
              </Link>
            }
          />
          <Persona
            photo="/images/government.jpg"
            photoLabel="A cable-stayed bridge over a lagoon"
            title="Government authorities"
            who="Officials responsible for security and infrastructure."
            points={[
              "See areas where a problem has persisted for weeks",
              "Acknowledge it and say what action is planned",
              "Listen to residents' original voice notes",
            ]}
            action={
              <a href="#trust" className={buttonClassName({ variant: "outline" })}>
                How flags work
              </a>
            }
          />
        </div>
      </section>

      <section id="trust" className={`${WRAP} scroll-mt-28 pt-24`} aria-labelledby="trust-heading">
        <SectionHead
          eyebrow="Why the numbers can be trusted"
          id="trust-heading"
          title={
            <>
              The longer you've lived there, <span className="text-faint">the more your rating counts.</span>
            </>
          }
        />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <Rung
            title="Not yet verified"
            weight={0.3}
            body="Anyone can rate from day one. Their rating counts, just the least."
          />
          <Rung
            title="Verified resident"
            weight={0.7}
            body="Confirmed by five night-time location checks inside the area. No location history is kept."
          />
          <Rung
            title="Long-term resident"
            weight={1}
            body="Verified for 60 days or more. These ratings carry the most weight."
          />
        </div>
        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3">
          <Note title="Recent ratings count more">A rating's weight halves every six months, so improvements show.</Note>
          <Note title="Flags need real evidence">Eight or more residents, five of them verified, for four weeks running.</Note>
          <Note title="Names are never shown">Reviews show a verification level, never who wrote them.</Note>
        </div>
      </section>

      {user?.role !== "government" && user?.role !== "admin" && (
        <section className={`${WRAP} pt-24`} aria-labelledby="share-heading">
          <div className="grid grid-cols-1 overflow-hidden rounded-xl border border-line bg-white md:grid-cols-2">
            <div
              className="min-h-[240px] bg-cover bg-center md:order-last md:min-h-[360px]"
              style={{ backgroundImage: "url(/images/residents.jpg)" }}
              role="img"
              aria-label="Two residents looking at a phone together"
            />
            <div className="flex flex-col justify-center gap-5 p-7 sm:p-12">
              <p className={text.eyebrow}>For residents</p>
              <h2 id="share-heading" className={text.displayLg}>
                Lived there? Help the next person who's deciding.
              </h2>
              <p className="max-w-[40ch] text-body-lg text-mute">
                Rate the things you know about your area and add a short comment, typed or spoken. It takes about a
                minute.
              </p>
              <div className="flex flex-wrap gap-2">
                {["English", "Yorùbá", "Igbo", "Hausa", "Pidgin"].map((l) => (
                  <span key={l} className="rounded-full border border-line px-3 py-1 text-caption text-mute">
                    {l}
                  </span>
                ))}
              </div>
              <div>
                <Link to={shareLink} className={buttonClassName({ variant: "primary" })}>
                  Share your experience
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function Hero({
  query,
  onQueryChange,
  featured,
}: {
  query: string;
  onQueryChange: (q: string) => void;
  featured: AreaEvidenceStack[];
}) {
  // The side panel shows the best-evidenced rated areas — real data only.
  const top = [...featured]
    .filter((a) => a.overall.score !== null)
    .sort((a, b) => b.overall.N - a.overall.N)
    .slice(0, 3);

  return (
    // Not overflow-hidden: the search dropdown has to be able to hang below
    // the hero. The photo layer clips itself instead.
    <section className="relative z-10 bg-night pb-16 pt-40 text-white sm:pt-44">
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-cover bg-[center_60%]" style={{ backgroundImage: "url(/images/hero.jpg)" }} />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,23,21,.6)_0%,rgba(17,23,21,.45)_35%,rgba(17,23,21,.92)_100%)]" />
      </div>

      <div className={`${WRAP} relative grid grid-cols-1 items-end gap-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_320px]`}>
        <div>
          <p className="text-eyebrow font-medium uppercase tracking-[0.14em] text-white/70">
            Rated by the people who live there
          </p>
          {/* Three lines: "Know a neighbourhood" / "before you" / "move in." — the
              first line never wraps, and the size is set so it fits its column
              at every width. */}
          <h1 className="mt-4 text-[clamp(30px,8.6vw,76px)] font-medium leading-[1.02] tracking-[-0.035em] lg:text-[clamp(56px,5.6vw,72px)]">
            <span className="block whitespace-nowrap">Know a neighbourhood</span>
            <span className="block text-white/55">before you move in.</span>
          </h1>
          <p className="mb-8 mt-5 max-w-[40ch] text-[18px] font-light leading-relaxed text-white/80">
            Power, water, security, flooding and access, scored by residents and weighted by how well each one is
            verified.
          </p>
          <div className="max-w-xl text-ink">
            <LocationSearchInput value={query} onChange={onQueryChange} />
          </div>
          <p className="mt-4 text-body text-white/60">Currently covering Lagos State, with more states to follow.</p>
        </div>

        {top.length > 0 && (
          <aside className="flex flex-col gap-2" aria-label="Most-rated areas">
            <p className="mb-1 text-eyebrow font-medium uppercase tracking-[0.14em] text-white/70">Most-rated areas</p>
            {top.map(({ area, overall }) => (
              <Link
                key={area.id}
                to={`/areas/${area.id}`}
                className="flex items-center gap-3 rounded-md border border-white/12 bg-night/55 px-4 py-3.5 backdrop-blur-md transition-colors hover:bg-night/70"
              >
                {overall.band && <span className={`h-2 w-2 shrink-0 rounded-full ${BAND_DOT_CLASS[overall.band]}`} />}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-body text-white/90">{area.name}</span>
                  <span className="block text-caption text-white/55">
                    {overall.N} resident{overall.N === 1 ? "" : "s"}
                  </span>
                </span>
                <span className="text-data-md tabular-nums text-white">{overall.score!.toFixed(1)}</span>
              </Link>
            ))}
          </aside>
        )}
      </div>
    </section>
  );
}

function SectionHead({
  eyebrow,
  title,
  id,
  action,
}: {
  eyebrow: string;
  title: ReactNode;
  id: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
      <div>
        <p className={text.eyebrow}>{eyebrow}</p>
        <h2 id={id} className={`${text.displayLg} mt-3 max-w-[22ch]`}>
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}

function Persona({
  photo,
  photoLabel,
  title,
  who,
  points,
  action,
}: {
  photo: string;
  photoLabel: string;
  title: string;
  who: string;
  points: string[];
  action: ReactNode;
}) {
  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-line bg-white">
      <div className="aspect-[4/3] bg-cover bg-center" style={{ backgroundImage: `url(${photo})` }} role="img" aria-label={photoLabel} />
      <div className="flex flex-1 flex-col gap-3 p-6">
        <h3 className="text-[24px] font-medium tracking-[-0.03em] text-ink">{title}</h3>
        <p className="text-body text-mute">{who}</p>
        <ul className="mb-3 mt-1 flex flex-col gap-2.5">
          {points.map((p) => (
            <li key={p} className="flex gap-2.5 text-body text-ink">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" aria-hidden="true" />
              {p}
            </li>
          ))}
        </ul>
        <div className="mt-auto">{action}</div>
      </div>
    </article>
  );
}

function Rung({ title, weight, body }: { title: string; weight: number; body: string }) {
  return (
    <article className="flex flex-col gap-3.5 rounded-lg border border-line bg-white p-6">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-heading font-medium tracking-[-0.02em] text-ink">{title}</h3>
        <span className="text-[30px] tracking-[-0.03em] tabular-nums text-brand">{weight.toFixed(1)}×</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-paper-2">
        <div className="h-full rounded-full bg-brand" style={{ width: `${weight * 100}%` }} />
      </div>
      <p className="text-body text-mute">{body}</p>
    </article>
  );
}

function Note({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-md bg-brand-soft px-5 py-5">
      <p className="font-medium text-ink">{title}</p>
      <p className="text-body text-[#4f5d56]">{children}</p>
    </div>
  );
}
