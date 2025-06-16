"use client";

import IconBubble from "@/components/icons/bubble.svg";
import IconHeart from "@/components/icons/hearth.svg";
import IconHeartFill from "@/components/icons/hearthFill.svg";
import IconShare from "@/components/icons/share.svg";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useIsTrackLiked } from "@/hooks/use-social-actions";
import { getUserInitials } from "@/lib/utils/avatar";
import { getCoverPlaceholder, getCoverUrl } from "@/lib/utils/cover";
import { fixIpfsUrl } from "@/lib/utils/ipfs";
import type { Track } from "@/types/track";
import { X } from "lucide-react";
import { useAccount } from "wagmi";

interface MusicPlayerProps {
  track: Track;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onClose: () => void;
  onLike?: (trackId: string) => void;
  onComment?: (trackId: string) => void;
  onShare?: (trackId: string) => void;
}

export function MusicPlayer({
  track,
  isPlaying: externalIsPlaying,
  onPlay,
  onPause,
  onClose,
  onLike,
  onComment,
  onShare,
}: MusicPlayerProps) {
  const { address } = useAccount();

  // Check if current user has liked this track
  const { data: isLikedData } = useIsTrackLiked(track.id);
  const isLiked = isLikedData?.isLiked || false;

  // Get the IPFS URL
  const audioUrl = fixIpfsUrl(track.mediaUrl || "");

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Music Player Overlay */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-background/95 backdrop-blur-sm border shadow-2xl">
          <div className="p-6 space-y-6">
            {/* Header with Close Button */}
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Now Playing</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Track Cover */}
            <div className="aspect-square w-full overflow-hidden rounded-lg bg-muted">
              <img
                src={getCoverUrl(track.image, track.genre)}
                alt={track.title}
                className="h-full w-full object-cover"
                onError={(e) => {
                  // If image fails to load, show placeholder
                  e.currentTarget.style.display = "none";
                  const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                  if (placeholder) {
                    placeholder.style.display = "flex";
                  }
                }}
              />
              <div
                className="flex h-full items-center justify-center bg-gradient-to-br from-[#ced925]/20 to-[#b8c220]/20"
                style={{ display: "none" }}
              >
                <span className="font-medium text-4xl">{getCoverPlaceholder(track.title)}</span>
              </div>
            </div>

            {/* Track Info */}
            <div className="text-center space-y-2">
              <h4 className="font-bold text-xl truncate">{track.title}</h4>
              <div className="flex items-center justify-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">
                    {getUserInitials(track.creators?.[0]?.name || "Unknown")}
                  </AvatarFallback>
                </Avatar>
                <span className="text-muted-foreground truncate">
                  {track.creators?.[0]?.name || "Unknown Artist"}
                </span>
              </div>
            </div>

            {/* Audio Player */}
            <div className="space-y-4">
              <audio
                controls
                className="w-full"
                src={audioUrl}
                onPlay={onPlay}
                onPause={onPause}
                onEnded={onPause}
                preload="metadata"
                autoPlay={externalIsPlaying}
              >
                <track kind="captions" label="Audio track" default />
                Your browser does not support the audio element.
              </audio>
            </div>

            {/* Social Actions */}
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0 hover:bg-[#ced925]/10"
                onClick={() => onLike?.(track.id)}
              >
                {isLiked ? (
                  <IconHeartFill className="h-5 w-5 text-[#ced925]" />
                ) : (
                  <IconHeart className="h-5 w-5 text-muted-foreground hover:text-[#ced925]" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0 hover:bg-[#ced925]/10"
                onClick={() => onComment?.(track.id)}
              >
                <IconBubble className="h-5 w-5 text-muted-foreground hover:text-[#ced925]" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0 hover:bg-[#ced925]/10"
                onClick={() => onShare?.(track.id)}
              >
                <IconShare className="h-5 w-5 text-muted-foreground hover:text-[#ced925]" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
