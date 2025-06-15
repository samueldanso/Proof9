"use client";

import { MusicPlayer } from "@/components/shared/music-player";
import { TrackCard } from "@/components/shared/track-card";
import { useUserLicensedTracks } from "@/hooks/api";
import { useAddComment, useLikeTrack, useUserLikes } from "@/hooks/use-social-actions";
import type { Track } from "@/types/track";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import LibraryTabs from "./_components/library-tabs";

export default function LibraryPage() {
  const { address } = useAccount();
  const [activeTab, setActiveTab] = useState<string>("liked");

  // Music player state
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Load user's liked tracks
  const { data: userLikes = [], isLoading: likesLoading } = useUserLikes();

  // Load user's licensed tracks
  const { data: licensedTracksResponse, isLoading: licensedLoading } = useUserLicensedTracks(
    address || "",
  );

  // Transform liked tracks for display - using Story Protocol Track format
  const likedTracks = useMemo(() => {
    return userLikes
      .map((like: any) => {
        if (like.tracks) {
          // Convert database track to Story Protocol Track format
          const track: Track = {
            id: like.tracks.id,
            title: like.tracks.title,
            description: like.tracks.description,
            creators: like.tracks.creators || [
              {
                name: like.tracks.artist_name || "Unknown Artist",
                address: like.tracks.artist_address || "",
                contributionPercent: 100,
              },
            ],
            image: like.tracks.image_url,
            imageHash: like.tracks.image_hash,
            mediaUrl: like.tracks.ipfs_url,
            mediaHash: like.tracks.media_hash,
            mediaType: like.tracks.media_type,
            genre: like.tracks.genre,
            tags: like.tracks.tags || [],
            duration: like.tracks.duration,
            plays: like.tracks.plays || 0,
            likes: like.tracks.likes_count || 0,
            comments: like.tracks.comments_count || 0,
            verified: like.tracks.verified || false,
            createdAt: like.tracks.created_at,
            ipId: like.tracks.ip_id,
            tokenId: like.tracks.token_id,
            transactionHash: like.tracks.transaction_hash,
          };
          return track;
        }
        return null;
      })
      .filter((track): track is Track => track !== null);
  }, [userLikes]);

  // Transform licensed tracks for display - using Story Protocol Track format
  const licensedTracksFormatted = useMemo(() => {
    const tracksArray = licensedTracksResponse?.data || [];

    return tracksArray
      .filter((license: any) => license.tracks)
      .map((license: any) => {
        // Convert database track to Story Protocol Track format
        const track: Track = {
          id: license.tracks.id,
          title: license.tracks.title,
          description: license.tracks.description,
          creators: license.tracks.creators || [
            {
              name: license.tracks.artist_name || "Unknown Artist",
              address: license.tracks.artist_address || "",
              contributionPercent: 100,
            },
          ],
          image: license.tracks.image_url,
          imageHash: license.tracks.image_hash,
          mediaUrl: license.tracks.ipfs_url,
          mediaHash: license.tracks.media_hash,
          mediaType: license.tracks.media_type,
          genre: license.tracks.genre,
          tags: license.tracks.tags || [],
          duration: license.tracks.duration,
          plays: license.tracks.plays || 0,
          likes: license.tracks.likes_count || 0,
          comments: license.tracks.comments_count || 0,
          verified: license.tracks.verified || false,
          createdAt: license.tracks.created_at,
          ipId: license.tracks.ip_id,
          tokenId: license.tracks.token_id,
          transactionHash: license.tracks.transaction_hash,
        };
        return track;
      });
  }, [licensedTracksResponse]);

  // Social actions hooks
  const likeTrackMutation = useLikeTrack();
  const addCommentMutation = useAddComment();

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handlePlay = (track: Track) => {
    if (currentTrack?.id === track.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
    }
  };

  const handleLike = (trackId: string) => {
    const track = currentTracks.find((t: Track) => t.id === trackId);
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
            {currentTracks.map((track: Track) => (
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
