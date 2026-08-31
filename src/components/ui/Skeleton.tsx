// Base pulsing placeholder block. Loading states across the app were plain
// "Loading..." text, which causes a hard layout jump the instant real
// content (a full Evidence Stack, a review list) arrives, and reads as
// unfinished rather than premium — worse on the slower mobile connections
// this product's actual users are on, not better. Composed skeletons below
// are shaped like their real content so the jump mostly disappears.
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-paper-2 ${className}`} />;
}

// Mirrors AreaCard's shape (name, city, score, band pill, aspect icon row).
export function AreaCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-lg bg-white p-6 shadow-card">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-3.5 w-1/3" />
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-16" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="flex gap-2 pt-1">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-8 w-8 rounded-sm" />
        ))}
      </div>
    </div>
  );
}

// Mirrors EvidenceStack's full-size shape (band, score, confidence strip,
// then one row per aspect).
export function EvidenceStackSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-lg bg-white p-8 shadow-card">
      <Skeleton className="h-6 w-24 rounded-full" />
      <Skeleton className="h-14 w-32" />
      <Skeleton className="h-3.5 w-48" />
      <Skeleton className="h-1.5 w-full rounded-full" />
      <div className="my-2 border-t border-line" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 shrink-0 rounded-sm" />
            <Skeleton className="h-4 w-24 shrink-0" />
            <Skeleton className="h-2 flex-1 rounded-full" />
            <Skeleton className="h-4 w-10 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Mirrors ReviewCard's shape (tier badge + date, a couple of text lines,
// aspect chips).
export function ReviewCardSkeleton() {
  return (
    <li className="flex flex-col gap-3 rounded-lg bg-white p-6 shadow-card">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-28 rounded-full" />
        <Skeleton className="h-3.5 w-20" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </li>
  );
}
