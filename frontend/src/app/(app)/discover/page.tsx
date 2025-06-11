"use client";

import { MusicPlayer } from "@/components/shared/music-player";
import { TrackCard } from "@/components/shared/track-card";
import { useTracks } from "@/lib/api/hooks";
import { transformDbTrackToLegacy } from "@/lib/api/types";
import {
  useLikeTrack,
  useAddComment,
  useUserLikes,
} from "@/hooks/use-social-actions";
import { useSearchParams } from "next/navigation";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import FeedTabs from "./_components/feed-tabs";
import TrendingBanner from "./_components/trending-banner";

export default function DiscoverPage() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<string>(
    tabParam === "verified" ||
      tabParam === "trending" ||
      tabParam === "following"
      ? tabParam
      : "following"
  );

  // Music player state
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // User authentication
  const { address } = useAccount();

  // Load tracks based on active tab
  const { data: tracksResponse, isLoading, error } = useTracks(activeTab);
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
