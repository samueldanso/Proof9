"use client";

import { MusicPlayer } from "@/components/shared/music-player";
import { TrackCard } from "@/components/shared/track-card";
import { useTracks } from "@/hooks/api";
import { useAddComment, useLikeTrack } from "@/hooks/use-social-actions";
import { analyzeTracksData } from "@/lib/utils/track-validation";
import type { Track } from "@/types/track";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import FeedSkeleton from "./_components/feed-skeleton";
import FeedTabs from "./_components/feed-tabs";
import GenreFilter from "./_components/genre-filter";
import TrendingBanner from "./_components/trending-banner";

export default function DiscoverPage() {
  return (
    <Suspense fallback={<FeedSkeleton />}>
      <DiscoverContent />
    </Suspense>
  );
}

function DiscoverContent() {
  const { address } = useAccount();
  const [activeTab, setActiveTab] = useState<"latest" | "following" | "trending">("latest");
  const [selectedGenre, setSelectedGenre] = useState("All");

  // Music player state for TrackCard
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

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

  // Analyze track data when tracks are loaded
  useEffect(() => {
    if (tracks.length > 0) {
      console.log("🔍 Analyzing track data from API...");
      analyzeTracksData(tracks);
    }
  }, [tracks]);

  // Social actions hooks for TrackCard functionality
  const likeTrackMutation = useLikeTrack();
  const addCommentMutation = useAddComment();

  // TrackCard event handlers
  const handlePlay = (track: Track) => {
    console.log("🎵 Discover - Play button clicked for track:", {
      id: track.id,
      title: track.title,
      mediaUrl: track.mediaUrl,
    });

    if (currentTrack?.id === track.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
    }
  };

  const handleLike = (trackId: string) => {
    const track = tracks.find((t: Track) => t.id === trackId);
    likeTrackMutation.mutate({ trackId, trackTitle: track?.title });
  };

  const handleComment = (trackId: string) => {
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

  const handleExploreClick = () => {
    setActiveTab("trending");
  };

  if (isLoading) {
    return <FeedSkeleton />;
  }

  if (error) {
    console.error("🚨 Discover - Error loading tracks:", error);
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="font-bold text-2xl">Error loading tracks</h2>
          <p className="text-muted-foreground">Please try again later</p>
          <pre className="mt-4 text-left text-red-500 text-sm">{JSON.stringify(error, null, 2)}</pre>
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
            // Grid layout with TrackCard component
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
            onClose={() => {
              setCurrentTrack(null);
              setIsPlaying(false);
            }}
            onLike={handleLike}
            onComment={handleComment}
            onShare={handleShare}
          />
        )}
      </div>
    </div>
  );
}
