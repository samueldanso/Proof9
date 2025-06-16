"use client";

import { MusicPlayer } from "@/components/shared/music-player";
import { useAddComment, useLikeTrack } from "@/hooks/use-social-actions";
import type { Track } from "@/types/track";
import { useState } from "react";
import { toast } from "sonner";
import { ProfileHeader } from "./_components/profile-header";
import { ProfileTabs } from "./_components/profile-tabs";

export default function ProfilePage() {
  // Music player state
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Social actions hooks
  const likeTrackMutation = useLikeTrack();
  const addCommentMutation = useAddComment();

  const handlePlay = (track: Track) => {
    if (currentTrack?.id === track.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
    }
  };

  const handleLike = (trackId: string) => {
    const track = currentTrack;
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

  return (
    <div className="w-full space-y-6">
      {/* Profile Header - Consistent with other pages */}
      <div className="mx-auto max-w-7xl px-4">
        <ProfileHeader />
      </div>

      {/* Profile Tabs - Consistent with other pages */}
      <div className="mx-auto max-w-7xl px-4">
        <ProfileTabs
          onPlay={handlePlay}
          onLike={handleLike}
          onComment={handleComment}
          onShare={handleShare}
          currentTrack={currentTrack}
          isPlaying={isPlaying}
        />
      </div>

      {/* Main Content Area - Left aligned like discover */}
      <div className="flex w-full gap-6">
        <div className="flex-1 space-y-6">{/* Content below tabs goes here */}</div>

        {/* Potential future sidebar space */}
        <div className="hidden w-72 lg:block">{/* Reserved for future content */}</div>
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
