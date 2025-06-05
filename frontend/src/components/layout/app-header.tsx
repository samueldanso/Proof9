"use client";

import { SearchBar } from "@/components/shared/search-bar";

export function AppHeader() {
  return (
    <header className="flex h-16 w-full items-center justify-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full max-w-2xl px-4">
        <SearchBar />
      </div>
    </header>
  );
}
