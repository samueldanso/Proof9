"use client";

import { MusicPlayer } from "@/components/shared/music-player";
import { TrackCard } from "@/components/shared/track-card";
import { useTracks } from "@/lib/api/hooks";
import { transformDbTrackToLegacy } from "@/lib/api/types";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import FeedTabs from "./_components/feed-tabs";
import TrendingBanner from "./_components/trending-banner";

export default function DiscoverPage() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<string>(
    tabParam === "verified" || tabParam === "trending" || tabParam === "following"
      ? tabParam
      : "following",
  );

  // Music player state
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Load tracks based on active tab
  const { data: tracksResponse, isLoading, error } = useTracks(activeTab);
  const dbTracks = tracksResponse?.data?.tracks || [];

  // Transform database tracks to legacy format for components
  const tracks = dbTracks.map(transformDbTrackToLegacy);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    window.history.pushState({}, "", url);
  };

  const handlePlay = (track: any) => {
    if (currentTrack?.id === track.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
    }
  };

  const handleLike = (trackId: string) => {
    console.log("Liking track:", trackId);
    // Handle like logic - integrate with API later
  };

  const handleComment = (trackId: string) => {
    console.log("Commenting on track:", trackId);
    // Handle comment logic - integrate with API later
  };

  const handleShare = (trackId: string) => {
    console.log("Sharing track:", trackId);
    // Handle share logic - integrate with API later
  };

  const handlePlayerClose = () => {
    setCurrentTrack(null);
    setIsPlaying(false);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <h3 className="mb-3 font-bold text-xl">Failed to load tracks</h3>
        <p className="text-muted-foreground">Please try again later</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="mx-auto max-w-2xl space-y-2 text-center">
        <h1 className="font-bold text-3xl">Discover</h1>
        <p className="text-muted-foreground">
          Explore verified music and find your next favorite sound
        </p>
      </div>

      {/* Trending Banner */}
      <TrendingBanner />

      {/* Feed Tabs */}
      <FeedTabs activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Track Feed */}
      <div className="mx-auto max-w-2xl space-y-6">
        {isLoading ? (
          // Loading state
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-32 w-full rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : tracks.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <h3 className="mb-3 font-bold text-xl">No tracks found</h3>
            <p className="text-muted-foreground">
              {activeTab === "verified"
                ? "No verified tracks available yet"
                : activeTab === "trending"
                  ? "No trending tracks available yet"
                  : "No tracks available yet"}
            </p>
          </div>
        ) : (
          // Track list
          tracks.map((track) => (
            <TrackCard
              key={track.id}
              track={track}
              onPlay={handlePlay}
              onLike={handleLike}
              onComment={handleComment}
              onShare={handleShare}
              isPlaying={currentTrack?.id === track.id && isPlaying}
              variant="feed"
            />
          ))
        )}
      </div>

      {/* Music Player */}
      {currentTrack && (
        <MusicPlayer
          track={currentTrack}
          isPlaying={isPlaying}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onClose={handlePlayerClose}
        />
      )}
    </div>
  );
}
