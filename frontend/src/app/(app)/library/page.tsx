"use client";

import { useUserLicensedTracks } from "@/api/hooks";
import { transformDbTrackToLegacy } from "@/api/types";
import { MusicPlayer } from "@/components/shared/music-player";
import { TrackCard } from "@/components/shared/track-card";
import { useAddComment, useLikeTrack, useUserLikes } from "@/hooks/use-social-actions";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import LibraryTabs from "./_components/library-tabs";

export default function LibraryPage() {
  const { address } = useAccount();
  const [activeTab, setActiveTab] = useState<string>("liked");

  // Music player state
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Load user's liked tracks
  const { data: userLikes = [], isLoading: likesLoading } = useUserLikes();

  // Load user's licensed tracks
  const { data: licensedTracks = [], isLoading: licensedLoading } = useUserLicensedTracks(
    address || "",
  );

  // Transform liked tracks for display
  const likedTracks = useMemo(() => {
    return userLikes
      .map((like) => {
        if (like.tracks) {
          return {
            ...transformDbTrackToLegacy(like.tracks as any),
            isLiked: true,
          };
        }
        return null;
      })
      .filter((track) => track !== null);
  }, [userLikes]);

  // Transform licensed tracks for display
  const licensedTracksFormatted = useMemo(() => {
    return licensedTracks
      .filter((license: any) => license.tracks) // Filter first to avoid nulls
      .map((license: any) => ({
        ...transformDbTrackToLegacy(license.tracks as any),
        isLiked: false, // We'll check this separately
        licenseInfo: {
          purchaseDate: license.created_at,
          licenseType: license.license_type,
          pricePaid: license.price_paid,
          status: license.status,
        },
      }));
  }, [licensedTracks]);

  // Social actions hooks
  const likeTrackMutation = useLikeTrack();
  const addCommentMutation = useAddComment();

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
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
    const track = currentTracks.find((t) => t.id === trackId);
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

  const handlePlayerClose = () => {
    setCurrentTrack(null);
    setIsPlaying(false);
  };

  // Get current tracks based on active tab
  const currentTracks = activeTab === "liked" ? likedTracks : licensedTracksFormatted;
  const isLoading = activeTab === "liked" ? likesLoading : licensedLoading;

  // Get empty state message
  const getEmptyMessage = () => {
    if (activeTab === "liked") {
      return {
        title: "No liked tracks yet",
        description: "Tracks you like will appear here",
      };
    }
    return {
      title: "No licensed tracks yet",
      description: "Music you've licensed for use will appear here",
    };
  };

  if (!address) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <h3 className="mb-3 font-bold text-xl">Connect Your Wallet</h3>
        <p className="text-muted-foreground">
          Please connect your wallet to view your music library
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Library Header */}
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-6">
          <h1 className="mb-2 font-bold text-3xl">Your Library</h1>
          <p className="text-muted-foreground">Your liked tracks and licensed music collection</p>
        </div>
      </div>

      {/* Library Tabs - Aligned with header and content */}
      <div className="mx-auto max-w-7xl px-4">
        <LibraryTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          likedCount={likedTracks.length}
          licensedCount={licensedTracksFormatted.length}
        />
      </div>

      {/* Track Grid */}
      <div className="mx-auto max-w-7xl px-4">
        {isLoading ? (
          // Loading state - Grid skeleton
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="mb-3 aspect-square w-full rounded-lg bg-muted" />
                <div className="mb-2 h-4 rounded bg-muted" />
                <div className="h-3 w-2/3 rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : currentTracks.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <h3 className="mb-3 font-bold text-xl">{getEmptyMessage().title}</h3>
            <p className="text-muted-foreground">{getEmptyMessage().description}</p>
          </div>
        ) : (
          // Track grid - 4 columns on large screens, responsive
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {currentTracks.map((track) => (
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
