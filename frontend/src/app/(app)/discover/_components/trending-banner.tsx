"use client";

import { Button } from "@/components/ui/button";

interface TrendingBannerProps {
  onExploreClick: () => void;
}

export default function TrendingBanner({ onExploreClick }: TrendingBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-6 text-primary-foreground">
      {/* Enhanced background decoration */}
      <div className="-top-4 -right-4 absolute size-24 rounded-full bg-white/10" />
      <div className="-bottom-2 -left-2 absolute size-16 rounded-full bg-white/5" />
      <div className="absolute top-1/2 right-1/4 size-8 rounded-full bg-white/10" />

      <div className="relative z-10">
        <h3 className="mb-2 font-bold text-lg">🔥 Discover Verified Music</h3>
        <p className="mb-4 text-primary-foreground/90 text-sm leading-relaxed">
          Find authentic tracks verified by Yakoa and protected by Story Protocol
        </p>
        <Button
          size="sm"
          variant="secondary"
          className="bg-white font-medium text-primary hover:bg-white/90"
          onClick={onExploreClick}
        >
          Explore Trending
        </Button>
      </div>
    </div>
  );
}
