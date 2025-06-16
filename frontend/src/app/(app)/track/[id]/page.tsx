"use client";

import { MusicPlayer } from "@/components/shared/music-player";
import { TrackActions } from "@/components/shared/track-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { VerificationBadge } from "@/components/ui/verification-badge";
import { useTrack } from "@/hooks/api";
import {
  useAddComment,
  useIsTrackLiked,
  useLikeTrack,
  useTrackComments,
} from "@/hooks/use-social-actions";
import type { Track } from "@/types/track";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import CommentsSection from "./_components/comments-section";
import LicenseInfo from "./_components/license-info";
import TrackHeader from "./_components/track-header";
import TrackMedia from "./_components/trackmedia";

export default function TrackPage() {
  const params = useParams();
  const trackId = params.id as string;
  const [isPlaying, setIsPlaying] = useState(false);
  const [showMusicPlayer, setShowMusicPlayer] = useState(false);

  // Load track data from API - Story Protocol format
  const { data: trackResponse, isLoading, error } = useTrack(trackId);
  const track: Track | null = trackResponse?.data || null;

  // Social actions hooks
  const likeTrackMutation = useLikeTrack();
  const addCommentMutation = useAddComment();
  const { data: commentsData } = useTrackComments(trackId);
  const { data: isLikedData } = useIsTrackLiked(trackId);
  const { address } = useAccount();

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
    setShowMusicPlayer(true);
  };

  const handleLike = () => {
    if (!address) {
      toast.error("Please connect your wallet to like tracks");
      return;
    }
    likeTrackMutation.mutate({ trackId, trackTitle: track?.title });
  };

  const handleComment = () => {
    // Scroll to comments section
    document.getElementById("comments-section")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/track/${trackId}`;
    if (navigator.share) {
      navigator.share({
        title: track?.title || "Check out this track",
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Track link copied to clipboard!");
    }
  };

  const handlePlayerClose = () => {
    setShowMusicPlayer(false);
    setIsPlaying(false);
  };

  // Helper functions for Story Protocol data
  const getArtistName = () => track?.creators?.[0]?.name || "Unknown Artist";
  const getArtistAddress = () => track?.creators?.[0]?.address || "";

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-6 py-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="animate-pulse space-y-4">
              <div className="h-8 w-48 rounded bg-muted" />
              <div className="h-64 w-full rounded bg-muted" />
              <div className="h-32 w-full rounded bg-muted" />
            </div>
          </div>
          <div className="space-y-6">
            <div className="animate-pulse">
              <div className="h-96 w-full rounded bg-muted" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !track) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-center px-6 py-12 text-center">
        <h2 className="mb-4 font-bold text-2xl">Track Not Found</h2>
        <p className="text-muted-foreground">
          The track you're looking for doesn't exist or has been removed.
        </p>
        <Button className="mt-6" onClick={() => window.history.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  // Create adapter objects for components that expect legacy interface
  const trackHeaderData = {
    id: track.id,
    title: track.title,
    artist: getArtistName(),
    artistAddress: getArtistAddress(),
    artistUsername: track.creatorUsername,
    duration: track.duration || "0:00",
    plays: track.plays || 0,
    verified: track.verified || false,
    likes: track.likes || 0,
    comments: track.comments || 0,
    isLiked: isLikedData?.isLiked || false,
    imageUrl: track.image,
    description: track.description,
    genre: track.genre,
    createdAt: track.createdAt,
  };

  const trackMediaData = {
    id: track.id,
    title: track.title,
    artist: getArtistName(),
    artistAddress: getArtistAddress(),
    duration: track.duration || "0:00",
    plays: track.plays || 0,
    verified: track.verified || false,
    likes: track.likes || 0,
    comments: track.comments || 0,
    isLiked: isLikedData?.isLiked || false,
    imageUrl: track.image, // Story Protocol image field
    description: track.description,
    genre: track.genre,
    createdAt: track.createdAt,
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-6">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Side - Track Details (2/3 width) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Track Header */}
          <TrackHeader track={trackHeaderData} />

          {/* Track Media Player */}
          <TrackMedia track={trackMediaData} isPlaying={isPlaying} onPlay={handlePlay} />

          {/* About This Track */}
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <h2 className="font-semibold text-lg">About this track</h2>
                <p className="mt-2 text-muted-foreground">
                  {track.description || "No description provided for this track."}
                </p>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Genre:</span>
                  <p className="text-muted-foreground">{track.genre || "Unknown"}</p>
                </div>
                <div>
                  <span className="font-medium">Duration:</span>
                  <p className="text-muted-foreground">{track.duration || "Unknown"}</p>
                </div>
                <div>
                  <span className="font-medium">Plays:</span>
                  <p className="text-muted-foreground">{(track.plays || 0).toLocaleString()}</p>
                </div>
                <div>
                  <span className="font-medium">Created:</span>
                  <p className="text-muted-foreground">{track.createdAt || "Unknown"}</p>
                </div>
              </div>

              {/* Story Protocol Creators */}
              {track.creators && track.creators.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <span className="font-medium">Creators:</span>
                    <div className="mt-2 space-y-2">
                      {track.creators.map((creator, index) => (
                        <div
                          key={creator.address || `creator-${index}`}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-muted-foreground">{creator.name}</span>
                          <span className="text-muted-foreground">
                            {creator.contributionPercent}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <Separator />

              {/* Track Actions */}
              <TrackActions
                trackId={track.id}
                likes={track.likes || 0}
                comments={track.comments || 0}
                isLiked={isLikedData?.isLiked || false}
                onLike={handleLike}
                onComment={handleComment}
                onShare={handleShare}
              />
            </div>
          </Card>

          {/* Story Protocol Details */}
          <Card className="p-6">
            <h3 className="mb-4 font-semibold text-lg">Story Protocol Details</h3>
            <div className="space-y-4">
              <div>
                <span className="font-medium">Verification Status:</span>
                <div className="mt-1">
                  {track.verified ? (
                    <VerificationBadge verified={track.verified} showText={true} size="sm" />
                  ) : (
                    <Badge variant="secondary" className="text-yellow-600">
                      ⏳ Pending Verification
                    </Badge>
                  )}
                </div>
              </div>

              {track.ipId && (
                <div>
                  <span className="font-medium">IP Asset ID:</span>
                  <p className="break-all font-mono text-muted-foreground text-xs">{track.ipId}</p>
                </div>
              )}

              {track.tokenId && (
                <div>
                  <span className="font-medium">Token ID:</span>
                  <p className="break-all font-mono text-muted-foreground text-xs">
                    {track.tokenId}
                  </p>
                </div>
              )}

              {track.mediaHash && (
                <div>
                  <span className="font-medium">Media Hash:</span>
                  <p className="break-all font-mono text-muted-foreground text-xs">
                    {track.mediaHash}
                  </p>
                </div>
              )}

              {track.yakoaTokenId && (
                <div>
                  <span className="font-medium">Yakoa Token ID:</span>
                  <p className="break-all font-mono text-muted-foreground text-xs">
                    {track.yakoaTokenId}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Comments Section - Aligned with cards above */}
          <div className="max-w-none">
            <CommentsSection trackId={track.id} />
          </div>
        </div>

        {/* Right Side - License & Rights Only (1/3 width) */}
        <div className="space-y-6">
          <LicenseInfo
            track={{
              id: track.id,
              title: track.title,
              artist: getArtistName(),
              artistAddress: getArtistAddress(),
              duration: track.duration || "0:00",
              plays: track.plays || 0,
              verified: track.verified || false,
              likes: track.likes || 0,
              comments: track.comments || 0,
              isLiked: isLikedData?.isLiked || false,
              imageUrl: track.image,
              description: track.description,
              genre: track.genre,
              createdAt: track.createdAt,
              license: {
                type: "Commercial",
                price: "10",
                available: true,
                terms: "Standard commercial license",
                downloads: 0,
              },
            }}
            ipAssetId={track.ipId}
          />
        </div>
      </div>

      {/* Music Player */}
      {showMusicPlayer && track && (
        <MusicPlayer
          track={track}
          isPlaying={isPlaying}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onClose={handlePlayerClose}
          onLike={() => handleLike()}
          onComment={() => handleComment()}
          onShare={() => handleShare()}
        />
      )}
    </div>
  );
}
