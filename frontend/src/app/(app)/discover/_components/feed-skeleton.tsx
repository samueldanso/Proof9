"use client";

// Generate unique keys for skeleton components
const genreSkeletonKeys = Array.from({ length: 8 }, () => crypto.randomUUID());
const trackSkeletonKeys = Array.from({ length: 12 }, () => crypto.randomUUID());

export default function FeedSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Trending Banner Skeleton */}
        <div className="h-32 animate-pulse rounded-xl bg-muted/50" />

        {/* Feed Tabs Skeleton */}
        <div className="flex gap-2">
          <div className="h-10 w-20 animate-pulse rounded-full bg-muted/50" />
          <div className="h-10 w-24 animate-pulse rounded-full bg-muted/50" />
          <div className="h-10 w-20 animate-pulse rounded-full bg-muted/50" />
        </div>

        {/* Genre Filter Skeleton */}
        <div className="flex flex-wrap gap-2">
          {genreSkeletonKeys.map((key) => (
            <div key={key} className="h-8 w-16 animate-pulse rounded-full bg-muted/50" />
          ))}
        </div>

        {/* Track Grid Skeleton - Matches TrackCard layout */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {trackSkeletonKeys.map((key) => (
            <TrackCardSkeleton key={key} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Individual track card skeleton that matches TrackCard component structure
function TrackCardSkeleton() {
  return (
    <div className="space-y-3 p-3">
      {/* Square album art skeleton */}
      <div className="aspect-square w-full animate-pulse rounded-xl bg-muted/50" />

      {/* Track info skeleton */}
      <div className="space-y-3">
        <div className="space-y-1">
          {/* Track title */}
          <div className="h-4 animate-pulse rounded bg-muted/50" />

          {/* Artist info */}
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 animate-pulse rounded-full bg-muted/50" />
            <div className="h-3 w-20 animate-pulse rounded bg-muted/50" />
          </div>

          {/* Stats line */}
          <div className="flex items-center gap-3">
            <div className="h-3 w-16 animate-pulse rounded bg-muted/50" />
            <div className="h-2 w-1 animate-pulse rounded-full bg-muted/50" />
            <div className="h-3 w-12 animate-pulse rounded bg-muted/50" />
          </div>
        </div>

        {/* Actions skeleton */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <div className="h-6 w-8 animate-pulse rounded bg-muted/50" />
            <div className="h-6 w-8 animate-pulse rounded bg-muted/50" />
          </div>
          <div className="h-8 w-16 animate-pulse rounded-full bg-muted/50" />
        </div>
      </div>
    </div>
  );
}
