"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getAvatarUrl, getUserInitials } from "@/lib/avatar";
import { Pause, Play } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { TrackActions } from "./track-actions";

interface Track {
  id: string;
  title: string;
  artist: string;
  artistAddress: string;
  duration: string;
  plays: number;
  verified: boolean;
  imageUrl?: string;
  audioUrl?: string;
  isLiked?: boolean;
  likes: number;
  comments: number;
  license?: {
    type: string;
    price: string;
    available: boolean;
    terms: string;
    downloads: number;
  };
}

interface TrackCardProps {
  track: Track;
  onPlay?: (track: Track) => void;
  onLike?: (trackId: string) => void;
  onComment?: (trackId: string) => void;
  onShare?: (trackId: string) => void;
  isPlaying?: boolean;
  showArtist?: boolean;
  variant?: "feed" | "profile";
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
}: TrackCardProps) {
  const [imageError, setImageError] = useState(false);
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

  return (
    <Card className="group cursor-pointer overflow-hidden border-0 bg-transparent p-0 transition-all hover:bg-accent/50">
      <div className="p-4" onClick={handleCardClick}>
        {/* Track Header with Artist Info */}
        {showArtist && variant === "feed" && (
          <div className="mb-3 flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={getAvatarUrl(null)} alt={track.artist} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {getUserInitials(track.artist)}
              </AvatarFallback>
            </Avatar>
            <div>
              <Link
                href={`/profile/${track.artistAddress}`}
                className="font-medium text-sm hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {track.artist}
              </Link>
            </div>
          </div>
        )}

        {/* Track Content */}
        <div className="space-y-3">
          {/* Album Art with Play Button */}
          <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-neutral-200 dark:bg-neutral-800">
            {track.imageUrl && !imageError ? (
              <img
                src={track.imageUrl}
                alt={track.title}
                className="h-full w-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="text-6xl text-neutral-400">🎵</div>
              </div>
            )}

            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all group-hover:bg-black/20">
              <Button
                size="lg"
                variant="ghost"
                className="h-16 w-16 rounded-full bg-white/90 text-black opacity-0 transition-all hover:bg-white group-hover:opacity-100"
                onClick={handlePlayClick}
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6 fill-current" />
                ) : (
                  <Play className="h-6 w-6 fill-current" />
                )}
              </Button>
            </div>

            {/* Verification Badge */}
            {track.verified && (
              <div className="absolute top-2 right-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500">
                  <div className="h-2 w-2 rounded-full bg-white" />
                </div>
              </div>
            )}
          </div>

          {/* Track Info */}
          <div className="space-y-1">
            <h3 className="font-semibold text-lg leading-tight">
              {track.title}
            </h3>
            <div className="flex items-center gap-4 text-muted-foreground text-sm">
              <span>{track.duration}</span>
              <span>{track.plays.toLocaleString()} plays</span>
            </div>
          </div>

          {/* Track Actions */}
          <TrackActions
            trackId={track.id}
            likes={track.likes}
            comments={track.comments}
            isLiked={track.isLiked}
            onLike={onLike}
            onComment={onComment}
            onShare={onShare}
            licensePrice={track.license?.price.replace("$", "")}
          />
        </div>
      </div>
    </Card>
  );
}
