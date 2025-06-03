"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { PageSize } from "@lens-protocol/client";
import { useAccounts } from "@lens-protocol/react";
import { ArrowLeft, CircleNotch, MagnifyingGlass } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface SearchBarProps {
  className?: string;
}

export function SearchBar({ className }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState<any>(undefined);
  const resultsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Update search filter when query changes
  useEffect(() => {
    setSearchFilter(
      query.length > 1
        ? {
            searchBy: {
              localNameQuery: query,
            },
          }
        : undefined,
    );
  }, [query]);

  // Use the Lens useAccounts hook to search for profiles
  const { data, loading, error } = useAccounts({
    filter: searchFilter,
    orderBy: "BEST_MATCH",
    pageSize: PageSize.Ten,
  });

  // Extract error message if we have one
  useEffect(() => {
    if (error) {
      console.error("Lens search error:", error);
      setErrorMessage(
        typeof error === "object" && error !== null
          ? // @ts-ignore - runtime type checking
            error.message || error.error || error.toString()
          : String(error),
      );
    } else {
      setErrorMessage(null);
    }
  }, [error]);

  const results = data?.items || [];

  // Handle click outside to close results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || results.length === 0) return;

    // Arrow down - move selection down
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prevIndex) => (prevIndex < results.length - 1 ? prevIndex + 1 : prevIndex));
    }

    // Arrow up - move selection up
    else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : prevIndex));
    }

    // Enter - navigate to selected profile
    else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        const profile = results[selectedIndex];
        navigateToProfile(profile.username?.value);
      }
    }

    // Escape - close results
    else if (e.key === "Escape") {
      e.preventDefault();
      setShowResults(false);
    }
  };

  const navigateToProfile = (handle?: string) => {
    if (!handle) return;

    // Extract just the username part without namespace
    const usernameParts = handle.split("/");
    const username = usernameParts[usernameParts.length - 1];

    setShowResults(false);
    setQuery("");
    router.push(`/u/${username}`);
  };

  return (
    <div className={cn("relative w-full", className)}>
      {/* Search bar - visible on mobile and desktop */}
      <div className="relative w-full">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <MagnifyingGlass className="size-4 text-muted-foreground" weight="bold" />
        </div>
        <Input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowResults(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search..."
          className="h-10 w-full rounded-md border-border/60 bg-background pl-12 text-sm shadow-sm focus-visible:border-[#00A8FF]/30 focus-visible:ring-[#00A8FF]/20"
        />
      </div>

      {/* Mobile full-screen search (when results are showing) */}
      {showResults && (
        <div
          ref={resultsRef}
          className={cn(
            "absolute left-0 z-50 mt-1 w-full overflow-hidden rounded-md border bg-background shadow-md",
            // On mobile, make it fullscreen
            "md:top-full md:z-10 md:mt-1",
            query.length > 1 || results.length > 0 ? "block" : "hidden",
          )}
        >
          {loading ? (
            <div className="flex items-center justify-center p-4">
              <CircleNotch className="size-5 animate-spin text-muted-foreground" weight="bold" />
            </div>
          ) : results.length > 0 ? (
            <div className="max-h-[300px] overflow-y-auto py-1">
              {results.map((account, index) => {
                const username = account.username?.value;
                const displayName =
                  account.metadata?.name || account.username?.localName || "Unknown";
                const avatarUrl = account.metadata?.picture || "";

                return (
                  <div
                    key={account.address}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 px-4 py-2 hover:bg-accent",
                      selectedIndex === index && "bg-accent",
                    )}
                    onClick={() => navigateToProfile(username)}
                  >
                    <Avatar className="size-8">
                      <AvatarImage src={avatarUrl} />
                      <AvatarFallback>{displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{displayName}</p>
                      {username && (
                        <p className="text-muted-foreground text-sm">
                          @{username.split("/").pop()}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : query.length > 1 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              No results found for &quot;{query}&quot;
              {errorMessage && <p className="mt-1 text-red-500 text-xs">Error: {errorMessage}</p>}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
