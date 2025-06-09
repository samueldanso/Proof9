"use client";

import { ConnectButton } from "@/components/auth/connect";
import { SearchBar } from "@/components/shared/search-bar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu, Search, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "./logo";
import { Sidebar } from "./sidebar";

export function AppHeader() {
  const isMobile = useIsMobile();
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  if (isMobile) {
    return (
      <header className="flex h-16 w-full items-center justify-between bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {!isSearchExpanded ? (
          <>
            {/* Connected Address on Mobile */}
            <ConnectButton variant="default" />
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => setIsSearchExpanded(true)}>
                <Search className="h-5 w-5" />
              </Button>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                  <div className="flex h-full flex-col">
                    <Sidebar />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </>
        ) : (
          <div className="flex w-full items-center gap-3">
            <div className="flex-1">
              <SearchBar />
            </div>
            <Button variant="ghost" size="sm" onClick={() => setIsSearchExpanded(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        )}
      </header>
    );
  }

  return (
    <header className="flex h-16 w-full items-center justify-between bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Empty space for balance */}
      <div />

      {/* Search Bar - Centered */}
      <div className="-translate-x-1/2 absolute left-1/2 transform">
        <SearchBar />
      </div>

      {/* Wallet Connection */}
      <div className="flex items-center">
        <ConnectButton variant="default" />
      </div>
    </header>
  );
}
