"use client";

import { SearchBar } from "@/components/shared/search-bar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu } from "lucide-react";
import { Logo } from "./logo";
import { Sidebar } from "./sidebar";

export function AppHeader() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <header className="flex h-16 w-full items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Logo className="h-8 w-8" />
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0">
            <div className="flex h-full flex-col">
              {/* Search bar at top for mobile */}
              <div className="border-b p-4">
                <SearchBar />
              </div>
              {/* Sidebar content */}
              <div className="flex-1">
                <Sidebar />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </header>
    );
  }

  return (
    <header className="flex h-16 w-full items-center justify-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex w-full max-w-md justify-center px-4">
        <SearchBar />
      </div>
    </header>
  );
}
