"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getAvatarUrl, getUserInitials } from "@/lib/avatar";
import { getCoverPlaceholder, getCoverUrl } from "@/lib/cover";
import type { LegacyTrack } from "@/types/track";
import { Pause, Play } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { TrackActions } from "./track-actions";

// Helper function to format date for display
function formatTrackDate(dateString?: string): string {
  if (!dateString) return "";

  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  } catch {
    return "";
  }
}

interface TrackCardProps {
  track: LegacyTrack;
  onPlay?: (track: LegacyTrack) => void;
  onLike?: (trackId: string) => void;
  onComment?: (trackId: string) => void;
  onShare?: (trackId: string) => void;
  isPlaying?: boolean;
  showArtist?: boolean;
  variant?: "feed" | "profile" | "list";
  index?: number; // For numbered list display
}

export function TrackCard({
  track,
  onPlay,
  onLike,
  onComment,
  onShare,
  isPlaying = false,
  showArtist = true,
  variant = "feed",
  index,
}: TrackCardProps) {
  const router = useRouter();

  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onPlay?.(track);
  };

  const handleCardClick = () => {
    // Navigate to track detail page using Next.js router
    router.push(`/track/${track.id}`);
  };

  // List variant for profile page
  if (variant === "list") {
    return (
      <Card className="group cursor-pointer overflow-hidden border-0 bg-transparent p-0 transition-all hover:bg-accent/50">
        <div className="p-4" onClick={handleCardClick}>
          <div className="flex items-center gap-4">
            {/* Track Number */}
            <div className="w-6 text-center font-medium text-muted-foreground text-sm">
              {index !== undefined ? index + 1 : "—"}
            </div>

            {/* Track Cover */}
            <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-neutral-200 dark:bg-neutral-800">
              <img
                src={getCoverUrl(track.imageUrl, track.genre)}
                alt={track.title}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  const placeholder = e.currentTarget
                    .nextElementSibling as HTMLElement;
                  if (placeholder) {
                    placeholder.style.display = "flex";
                  }
                }}
              />
              <div
                className="flex h-full items-center justify-center"
                style={{ display: "none" }}
              >
                <div className="text-neutral-400 text-xs">
                  {getCoverPlaceholder(track.title)}
                </div>
              </div>

              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all group-hover:bg-black/60">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 rounded-full bg-white/90 p-0 text-black opacity-0 transition-all hover:bg-white group-hover:opacity-100"
                  onClick={handlePlayClick}
                >
                  {isPlaying ? (
                    <Pause className="h-3 w-3 fill-current" />
                  ) : (
                    <Play className="h-3 w-3 fill-current" />
                  )}
                </Button>
              </div>
            </div>

            {/* Track Info */}
            <div className="min-w-0 flex-1">
              <h3 className="line-clamp-1 font-medium text-sm leading-tight">
                {track.title}
              </h3>
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <span>{track.plays.toLocaleString()} plays</span>
                {track.duration && (
                  <>
                    <span>•</span>
                    <span>{track.duration}</span>
                  </>
                )}
                {track.createdAt && (
                  <>
                    <span>•</span>
                    <span>{formatTrackDate(track.createdAt)}</span>
                  </>
                )}
                {track.verified && (
                  <>
                    <span>•</span>
                    <div className="flex h-3 w-3 items-center justify-center rounded-full bg-green-500">
                      <div className="h-1 w-1 rounded-full bg-white" />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Track Actions */}
            <div className="flex items-center gap-1">
              <TrackActions
                trackId={track.id}
                likes={track.likes}
                comments={track.comments}
                isLiked={track.isLiked}
                onLike={onLike}
                onComment={onComment}
                onShare={onShare}
                showLicenseButton={false}
              />
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Original grid variant (feed/profile)
  return (
    <Card className="group cursor-pointer overflow-hidden border-0 bg-transparent p-0 transition-all hover:bg-accent/50">
      <div className="p-3" onClick={handleCardClick}>
        {/* Track Content */}
        <div className="space-y-3">
          {/* Album Art with Play Button - Square aspect ratio for grid */}
          <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-neutral-200 dark:bg-neutral-800">
            <img
              src={getCoverUrl(track.imageUrl, track.genre)}
              alt={track.title}
              className="h-full w-full object-cover"
              onError={(e) => {
                // If image fails to load, show placeholder
                e.currentTarget.style.display = "none";
                const placeholder = e.currentTarget
                  .nextElementSibling as HTMLElement;
                if (placeholder) {
                  placeholder.style.display = "flex";
                }
              }}
            />
            <div
              className="flex h-full items-center justify-center"
              style={{ display: "none" }}
            >
              <div className="text-4xl text-neutral-400">
                {getCoverPlaceholder(track.title)}
              </div>
            </div>

            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all group-hover:bg-black/30">
              <Button
                size="sm"
                variant="ghost"
                className="h-12 w-12 rounded-full bg-white/90 text-black opacity-0 transition-all hover:bg-white group-hover:opacity-100"
                onClick={handlePlayClick}
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5 fill-current" />
                ) : (
                  <Play className="h-5 w-5 fill-current" />
                )}
              </Button>
            </div>

            {/* Verification Badge */}
            {track.verified && (
              <div className="absolute top-2 right-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500">
                  <div className="h-1.5 w-1.5 rounded-full bg-white" />
                </div>
              </div>
            )}

            {/* Duration Badge */}
            <div className="absolute right-2 bottom-2">
              <div className="rounded bg-black/70 px-1.5 py-0.5 text-white text-xs">
                {track.duration}
              </div>
            </div>
          </div>

          {/* Track Info - Optimized for grid */}
          <div className="space-y-1">
            <h3 className="line-clamp-2 font-semibold text-sm leading-tight">
              {track.title}
            </h3>

            {/* Artist info - More compact for grid */}
            {showArtist && (
              <div className="flex items-center gap-2">
                <Avatar className="h-4 w-4">
                  <AvatarImage
                    src={getAvatarUrl(track.artistAvatarUrl)}
                    alt={track.artist}
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {getUserInitials(track.artist)}
                  </AvatarFallback>
                </Avatar>
                <Link
                  href={`/profile/${
                    track.artistUsername || track.artistAddress
                  }`}
                  className="line-clamp-1 text-muted-foreground text-xs hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {track.artist}
                </Link>
              </div>
            )}

            {/* Stats - Compact for grid */}
            <div className="flex items-center justify-between text-muted-foreground text-xs">
              <span>{track.plays.toLocaleString()} plays</span>
              <div className="flex items-center gap-3">
                <span>♡ {track.likes}</span>
                <span>💬 {track.comments}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
