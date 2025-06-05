"use client";

import { SearchBar } from "@/components/shared/search-bar";
import { MobileNav } from "./mobile-nav";

export function AppHeader() {
  return (
    <header className="relative flex h-[56px] w-full flex-none items-center justify-center">
      <span className="absolute left-4 flex items-center">
        <SearchBar />
      </span>
    </header>
  );
}
