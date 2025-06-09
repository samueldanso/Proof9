"use client";

import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { useSearchUsers } from "@/lib/api/hooks";
import { getAvatarUrl } from "@/lib/avatar";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState, useRef, useEffect } from "react";

export const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Debounce search query to avoid too many API calls
  const debouncedQuery = useDebounce(query, 300);

  // Search for users
  const { data: searchResults = [], isLoading } = useSearchUsers(debouncedQuery);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(value.trim().length > 0);
  };

  const handleUserClick = (user: any) => {
    // Navigate to profile - use username if available, otherwise address
    const identifier = user.username || user.address;
    router.push(`/profile/${identifier}`);
    setQuery("");
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const getDisplayName = (user: any) => {
    return (
      user.display_name ||
      `${user.address?.substring(0, 6)}...${user.address?.substring(user.address.length - 4)}`
    );
  };

  return (
    <div className="relative w-full max-w-2xl">
      <Search className="-translate-y-1/2 absolute top-1/2 left-4 h-4 w-4 text-muted-foreground" />
      <Input
        ref={inputRef}
        type="text"
        placeholder="Search sounds & creators..."
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => query.trim().length > 0 && setIsOpen(true)}
        className="h-10 rounded-full border-none bg-muted/50 pr-4 pl-11 focus:bg-background focus:ring-2 focus:ring-ring"
      />

      {/* Search Results Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-12 left-0 z-50 max-h-80 w-full overflow-y-auto rounded-lg border border-border bg-background shadow-lg"
        >
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">Searching creators...</div>
          ) : searchResults.length > 0 ? (
            <div className="py-2">
              <div className="px-3 py-2 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                Creators
              </div>
              {searchResults.map((user) => (
                <button
                  key={user.address}
                  type="button"
                  onClick={() => handleUserClick(user)}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-muted/50"
                >
                  <img
                    src={getAvatarUrl(user.avatar_url)}
                    alt=""
                    className="h-8 w-8 rounded-full bg-muted object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium text-foreground">
                        {getDisplayName(user)}
                      </span>
                      {user.verified && (
                        <div className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-500">
                          <svg
                            className="h-2.5 w-2.5 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    {user.username && (
                      <span className="text-muted-foreground text-sm">@{user.username}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : debouncedQuery.trim().length > 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No creators found for "{debouncedQuery}"
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
