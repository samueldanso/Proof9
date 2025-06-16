"use client";

import IconBubble from "@/components/icons/bubble.svg";
import IconHeart from "@/components/icons/hearth.svg";
import IconHeartFill from "@/components/icons/hearthFill.svg";
import IconShare from "@/components/icons/share.svg";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useIsTrackLiked } from "@/hooks/use-social-actions";
import { getUserInitials } from "@/lib/utils/avatar";
import { getCoverPlaceholder, getCoverUrl } from "@/lib/utils/cover";
import { fixIpfsUrl } from "@/lib/utils/ipfs";
import type { Track } from "@/types/track";
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
    <div className="fixed right-0 bottom-0 left-0 z-50 relative border-border border-t bg-gradient-to-r from-background via-background/95 to-background backdrop-blur-sm p-4 shadow-lg before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-[#ced925]/30 before:to-transparent">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        {/* Left: Track Info */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {/* Track Cover */}
          <div className="size-14 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
            <img
              src={getCoverUrl(track.image, track.genre)}
              alt={track.title}
              className="size-full object-cover"
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
              className="flex size-full items-center justify-center bg-gradient-to-br from-[#ced925]/20 to-[#b8c220]/20"
              style={{ display: "none" }}
            >
              <span className="font-medium text-xs">{getCoverPlaceholder(track.title)}</span>
            </div>
          </div>

          {/* Track Details */}
          <div className="min-w-0 flex-1">
            <div className="truncate font-semibold text-base">{track.title}</div>
            <div className="mt-1 flex items-center gap-2">
              <Avatar className="size-5">
                <AvatarFallback className="text-xs">
                  {getUserInitials(track.creators?.[0]?.name || "Unknown")}
                </AvatarFallback>
              </Avatar>
              <span className="truncate text-muted-foreground text-sm">
                {track.creators?.[0]?.name || "Unknown Artist"}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Native Audio Player */}
        <div className="flex max-w-md flex-1 flex-col items-center gap-2">
          <audio
            controls
            className="w-full max-w-md"
            src={audioUrl}
            onPlay={onPlay}
            onPause={onPause}
            onEnded={onPause}
            preload="metadata"
          >
            <track kind="captions" label="Audio track" default />
            Your browser does not support the audio element.
          </audio>
        </div>

        {/* Right: Social Actions */}
        <div className="flex flex-1 items-center justify-end gap-3">
          {/* Social Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="size-8 p-0 hover:bg-[#ced925]/10"
              onClick={() => onLike?.(track.id)}
            >
              {isLiked ? (
                <IconHeartFill className="size-4 text-[#ced925]" />
              ) : (
                <IconHeart className="size-4 text-muted-foreground hover:text-[#ced925]" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="size-8 p-0 hover:bg-[#ced925]/10"
              onClick={() => onComment?.(track.id)}
            >
              <IconBubble className="size-4 text-muted-foreground hover:text-[#ced925]" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="size-8 p-0 hover:bg-[#ced925]/10"
              onClick={() => onShare?.(track.id)}
            >
              <IconShare className="size-4 text-muted-foreground hover:text-[#ced925]" />
            </Button>
          </div>

          {/* Close Button */}
          <Button variant="ghost" size="sm" onClick={onClose} className="ml-2 size-8 p-0">
            ✕
          </Button>
        </div>
      </div>
    </div>
  );
}
