"use client";

import { Card } from "@/components/ui/card";
import { useTracks } from "@/hooks/api";
import type { Track } from "@/types/track";
import { Heart, Play, User, Verified } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useAccount } from "wagmi";
import FeedTabs from "./_components/feed-tabs";
import GenreFilter from "./_components/genre-filter";
import TrendingBanner from "./_components/trending-banner";

export default function DiscoverPage() {
  const { address } = useAccount();
  const [activeTab, setActiveTab] = useState<"latest" | "following" | "trending">("latest");
  const [selectedGenre, setSelectedGenre] = useState("All");

  // Fetch tracks using Story Protocol format
  const {
    data: tracksResponse,
    isLoading,
    error,
  } = useTracks({
    tab: activeTab,
    user_address: address,
    genre: selectedGenre === "All" ? undefined : selectedGenre,
  });

  const tracks = tracksResponse?.data?.tracks || [];

  const formatDuration = (duration: string) => {
    if (!duration || duration === "0:00") return "3:24"; // Default duration
    return duration;
  };

  const formatPlays = (plays: number) => {
    if (plays >= 1000000) {
      return `${(plays / 1000000).toFixed(1)}M`;
    }
    if (plays >= 1000) {
      return `${(plays / 1000).toFixed(1)}K`;
    }
    return plays.toString();
  };

  const getArtistName = (track: Track) => {
    // Use Story Protocol creators array
    return track.creators?.[0]?.name || "Unknown Artist";
  };

  const getArtistAddress = (track: Track) => {
    // Use Story Protocol creators array
    return track.creators?.[0]?.address || "";
  };

  const handleExploreClick = () => {
    setActiveTab("trending");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="h-8 w-48 animate-pulse rounded bg-muted" />
            <div className="h-4 w-96 animate-pulse rounded bg-muted" />
          </div>
          <div className="grid gap-4">
            <div className="h-20 animate-pulse rounded-lg bg-muted" />
            <div className="h-20 animate-pulse rounded-lg bg-muted" />
            <div className="h-20 animate-pulse rounded-lg bg-muted" />
            <div className="h-20 animate-pulse rounded-lg bg-muted" />
            <div className="h-20 animate-pulse rounded-lg bg-muted" />
            <div className="h-20 animate-pulse rounded-lg bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="font-bold text-2xl">Error loading tracks</h2>
          <p className="text-muted-foreground">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Trending Banner - Beautiful glassy header */}
        <TrendingBanner onExploreClick={handleExploreClick} />

        {/* Feed Tabs - Beautiful pill-shaped design */}
        <FeedTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Genre Filter - Beautiful chip design */}
        <GenreFilter activeGenre={selectedGenre} onGenreChange={setSelectedGenre} />

        {/* Tab Content */}
        <div className="space-y-6">
            {tracks.length === 0 ? (
              <div className="py-12 text-center">
                <h3 className="font-semibold text-lg">No tracks found</h3>
                <p className="text-muted-foreground">
                  {activeTab === "following"
                    ? "Follow some artists to see their tracks here"
                    : "Try adjusting your filters or check back later"}
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {tracks.map((track) => (
                  <Card key={track.id} className="p-4 transition-shadow hover:shadow-md">
                    <div className="flex items-center space-x-4">
                      {/* Cover Art - Story Protocol image field */}
                      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                        {track.image ? (
                          <img
                            src={track.image}
                            alt={track.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Play className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity hover:opacity-100">
                          <Play className="h-6 w-6 text-white" />
                        </div>
                      </div>

                      {/* Track Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/track/${track.id}`}
                            className="truncate font-semibold text-lg hover:underline"
                          >
                            {track.title}
                          </Link>
                          {track.verified && (
                            <Verified className="h-4 w-4 flex-shrink-0 text-blue-500" />
                          )}
                        </div>

                        <div className="flex items-center space-x-2 text-muted-foreground">
                          <Link
                            href={`/profile/${getArtistAddress(track)}`}
                            className="flex items-center space-x-1 hover:underline"
                          >
                            <User className="h-4 w-4" />
                            <span>{getArtistName(track)}</span>
                          </Link>
                          <span>•</span>
                          <span>{formatDuration(track.duration || "")}</span>
                          {track.genre && (
                            <>
                              <span>•</span>
                              <span className="rounded bg-muted px-2 py-1 text-xs">
                                {track.genre}
                              </span>
                            </>
                          )}
                        </div>

                        {track.description && (
                          <p className="mt-1 line-clamp-1 text-muted-foreground text-sm">
                            {track.description}
                          </p>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="flex items-center space-x-4 text-muted-foreground text-sm">
                        <div className="flex items-center space-x-1">
                          <Play className="h-4 w-4" />
                          <span>{formatPlays(track.plays || 0)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Heart className="h-4 w-4" />
                          <span>{track.likes || 0}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
