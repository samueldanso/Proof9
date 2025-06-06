"use client";

import { Button } from "@/components/ui/button";

export default function TrendingBanner() {
  return (
    <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-primary/20 via-primary/10 to-background p-6">
      {/* Background decoration */}
      <div className="-translate-y-4 absolute top-0 right-0 h-20 w-20 translate-x-4 rounded-full bg-primary/10" />
      <div className="-translate-x-2 absolute bottom-0 left-0 h-12 w-12 translate-y-2 rounded-full bg-primary/5" />

      <div className="relative z-10">
        <h3 className="mb-2 font-bold text-lg">🔥 Discover Verified Music</h3>
        <p className="mb-4 text-muted-foreground text-sm">
          Find authentic tracks verified by Yakoa and protected by Story Protocol
        </p>
        <Button
          size="sm"
          className="bg-primary hover:bg-primary/90"
          onClick={() => {
            const url = new URL(window.location.href);
            url.searchParams.set("tab", "verified");
            window.history.pushState({}, "", url);
            window.location.reload();
          }}
        >
          Explore Verified
        </Button>
      </div>
    </div>
  );
}
