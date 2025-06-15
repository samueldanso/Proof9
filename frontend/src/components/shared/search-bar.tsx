"use client";

import { Input } from "@/components/ui/input";
import { useTracks } from "@/hooks/api";
import { useDebounce } from "@/hooks/use-debounce";
import { useSearchUsers } from "@/hooks/use-social-actions";
import type { Track } from "@/types/track";

import { getAvatarUrl } from "@/lib/utils/avatar";
import { getCoverUrl } from "@/lib/utils/cover";
import { Music, Search, User, Verified } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState, useRef, useEffect, useMemo } from "react";

export const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "tracks" | "users" | "verified">("all");
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Debounce search query to avoid too many API calls
  const debouncedQuery = useDebounce(query, 300);

  // Search for users and tracks
  const { data: searchUsers = [], isLoading: isLoadingUsers } = useSearchUsers(debouncedQuery);
  const { data: tracksResponse, isLoading: isLoadingTracks } = useTracks({ limit: 20 });

  // Filter tracks based on search query
  const searchTracks = useMemo(() => {
    if (!debouncedQuery.trim() || !tracksResponse?.data?.tracks) return [];

    const tracks: Track[] = tracksResponse.data.tracks;
    return tracks
      .filter(
        (track) =>
          track.title.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
          track.creators?.[0]?.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
          track.genre?.toLowerCase().includes(debouncedQuery.toLowerCase()),
      )
      .slice(0, 5); // Limit to 5 results
  }, [debouncedQuery, tracksResponse]);

  // Filter results based on active filter
  const filteredResults = useMemo(() => {
    switch (activeFilter) {
      case "tracks":
        return { users: [], tracks: searchTracks };
      case "users":
        return { users: searchUsers, tracks: [] };
      case "verified":
        return {
          users: searchUsers.filter((user) => user.verified),
          tracks: searchTracks.filter((track) => track.verified),
        };
      default:
        return { users: searchUsers, tracks: searchTracks };
    }
  }, [activeFilter, searchUsers, searchTracks]);

  const isLoading = isLoadingUsers || isLoadingTracks;

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

  const handleTrackClick = (track: any) => {
    // Navigate to track detail page
    router.push(`/track/${track.id}`);
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

  const filterTabs = [
    { key: "all", label: "All", icon: Search },
    { key: "tracks", label: "Tracks", icon: Music },
    { key: "users", label: "Users", icon: User },
    { key: "verified", label: "Verified", icon: Verified },
  ] as const;

  return (
    <div className="relative w-full">
      <Search className="-translate-y-1/2 absolute top-1/2 left-4 h-4 w-4 text-muted-foreground" />
      <Input
        ref={inputRef}
        type="text"
        placeholder="Search"
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => query.trim().length > 0 && setIsOpen(true)}
        className="h-9 w-full rounded-full border-none bg-muted/50 pr-4 pl-11 focus:bg-background focus:ring-2 focus:ring-ring"
      />

      {/* Search Results Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-13 left-0 z-50 max-h-80 w-full overflow-y-auto rounded-lg border border-border bg-background shadow-lg"
        >
          {/* Filter Tabs */}
          {debouncedQuery.trim().length > 0 && (
            <div className="flex gap-1 border-border border-b p-2">
              {filterTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveFilter(tab.key)}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium text-xs transition-colors ${
                      activeFilter === tab.key
                        ? "bg-accent text-accent-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-accent/60 hover:text-accent-foreground"
                    }`}
                  >
                    <Icon className="h-3 w-3" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          )}

          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">Searching...</div>
          ) : filteredResults.users.length > 0 || filteredResults.tracks.length > 0 ? (
            <div className="py-2">
              {/* Tracks Section */}
              {filteredResults.tracks.length > 0 && (
                <>
                  <div className="px-3 py-2 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                    Tracks
                  </div>
                  {filteredResults.tracks.map((track) => (
                    <button
                      key={track.id}
                      type="button"
                      onClick={() => handleTrackClick(track)}
                      className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-muted/50"
                    >
                      <img
                        src={getCoverUrl(track.image)}
                        alt=""
                        className="h-8 w-8 rounded bg-muted object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-medium text-foreground">
                            {track.title}
                          </span>
                          {track.verified && <Verified className="h-3 w-3 text-blue-500" />}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <span>by {track.creators?.[0]?.name || "Unknown Artist"}</span>
                          {track.genre && (
                            <>
                              <span>•</span>
                              <span>{track.genre}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </>
              )}

              {/* Users Section */}
              {filteredResults.users.length > 0 && (
                <>
                  <div className="px-3 py-2 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                    Creators
                  </div>
                  {filteredResults.users.map((user) => (
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
                </>
              )}
            </div>
          ) : debouncedQuery.trim().length > 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No results found for "{debouncedQuery}"
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
