"use client";

import { MusicPlayer } from "@/components/shared/music-player";
import { TrackCard } from "@/components/shared/track-card";
import { useAddComment, useLikeTrack, useUserLikes } from "@/hooks/use-social-actions";
import { useTracks } from "@/lib/api/hooks";
import { transformDbTrackToLegacy } from "@/lib/api/types";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import FeedTabs from "./_components/feed-tabs";
import GenreFilter from "./_components/genre-filter";
import TrendingBanner from "./_components/trending-banner";

export default function DiscoverPage() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<string>(
    tabParam === "latest" || tabParam === "following" || tabParam === "trending"
      ? tabParam
      : "latest",
  );

  // Genre filter state
  const [activeGenre, setActiveGenre] = useState<string | null>(null);

  // Music player state
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // User authentication
  const { address } = useAccount();

  // Load tracks based on active tab and genre filter
  const {
    data: tracksResponse,
    isLoading,
    error,
  } = useTracks(activeTab, address || undefined, activeGenre || undefined);
  const dbTracks = tracksResponse?.data?.tracks || [];

  // Load user's liked tracks to determine isLiked status
  const { data: userLikes = [] } = useUserLikes();
  const likedTrackIds = useMemo(() => {
    return new Set(userLikes.map((like) => like.track_id));
  }, [userLikes]);

  // Transform database tracks to legacy format with real liked status
  const tracks = useMemo(() => {
    return dbTracks.map((dbTrack) => ({
      ...transformDbTrackToLegacy(dbTrack),
      isLiked: address ? likedTrackIds.has(dbTrack.id) : false,
    }));
  }, [dbTracks, likedTrackIds, address]);

  // Social actions hooks
  const likeTrackMutation = useLikeTrack();
  const addCommentMutation = useAddComment();

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    window.history.pushState({}, "", url);
  };

  const handleGenreChange = (genre: string | null) => {
    setActiveGenre(genre);
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
    likeTrackMutation.mutate(trackId);
  };

  const handleComment = (trackId: string) => {
    // For now, we'll navigate to track detail page for commenting
    // In the future, we could open a comment modal here
    window.location.href = `/track/${trackId}#comments`;
  };

  const handleShare = (trackId: string) => {
    const shareUrl = `${window.location.origin}/track/${trackId}`;
    if (navigator.share) {
      navigator.share({
        title: "Check out this track",
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Track link copied to clipboard!");
    }
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
    <div className="w-full space-y-6">
      {/* Header - More compact */}
      <div className="mx-auto max-w-4xl space-y-1 text-center">
        <h1 className="font-bold text-2xl">Discover</h1>
        <p className="text-muted-foreground text-sm">
          Explore verified music and find your next favorite sound
        </p>
      </div>

      {/* Trending Banner */}
      <div className="mx-auto max-w-4xl px-4">
        <TrendingBanner onExploreClick={() => handleTabChange("trending")} />
      </div>

      {/* Feed Tabs */}
      <FeedTabs activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Genre Filter */}
      <div className="mx-auto max-w-7xl px-4">
        <GenreFilter activeGenre={activeGenre} onGenreChange={handleGenreChange} />
      </div>

      {/* Track Feed - Grid Layout */}
      <div className="mx-auto max-w-7xl px-4">
        {isLoading ? (
          // Loading state - Grid skeleton
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="mb-3 aspect-square w-full rounded-lg bg-muted" />
                <div className="mb-2 h-4 rounded bg-muted" />
                <div className="h-3 w-2/3 rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : tracks.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <h3 className="mb-3 font-bold text-xl">No tracks found</h3>
            <p className="text-muted-foreground">
              {activeTab === "latest"
                ? "No new tracks uploaded yet"
                : activeTab === "following"
                  ? "No tracks from creators you follow yet"
                  : activeTab === "trending"
                    ? "No trending tracks available yet"
                    : "No tracks available yet"}
            </p>
          </div>
        ) : (
          // Track grid - 4 columns on large screens, responsive
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {tracks.map((track) => (
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
            ))}
          </div>
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
          onLike={handleLike}
          onComment={handleComment}
          onShare={handleShare}
        />
      )}
    </div>
  );
}
