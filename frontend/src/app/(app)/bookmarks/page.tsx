"use client";

import { Button } from "@/components/ui/button";

export default function BookmarksPage() {
  return (
    <div className="w-full px-4 pb-12 md:px-6">
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <h1 className="mb-3 font-bold text-2xl">Saved Posts</h1>
        <p className="mb-6 text-muted-foreground">
          Your saved posts will appear here. This feature is coming soon!
        </p>
        <Button variant="outline" onClick={() => window.history.back()}>
          Go Back
        </Button>
      </div>
    </div>
  );
}
