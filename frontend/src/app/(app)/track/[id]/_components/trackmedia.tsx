"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Pause, Play } from "lucide-react";
import { useState } from "react";

interface Track {
  id: string;
  title: string;
  artist: string;
  artistAddress: string;
  duration: string;
  plays: number;
  verified: boolean;
  likes: number;
  comments: number;
  isLiked: boolean;
  imageUrl?: string;
  description?: string;
  genre?: string;
  bpm?: number;
  key?: string;
  createdAt?: string;
  license?: {
    type: string;
    price: string;
    available: boolean;
    terms: string;
    downloads: number;
  };
}

interface TrackMediaProps {
  track: Track;
  isPlaying: boolean;
  onPlay: () => void;
}

export default function TrackMedia({ track, isPlaying, onPlay }: TrackMediaProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <Card className="overflow-hidden p-0">
      <div className="relative aspect-square w-full bg-neutral-200 dark:bg-neutral-800">
        {track.imageUrl && !imageError ? (
          <img
            src={track.imageUrl}
            alt={track.title}
            className="h-full w-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-8xl text-neutral-400">🎵</div>
          </div>
        )}

        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <Button
            size="lg"
            variant="ghost"
            className="h-20 w-20 rounded-full bg-white/90 text-black hover:bg-white"
            onClick={onPlay}
          >
            {isPlaying ? (
              <Pause className="h-8 w-8 fill-current" />
            ) : (
              <Play className="h-8 w-8 fill-current" />
            )}
          </Button>
        </div>

        {/* Duration Badge */}
        <div className="absolute right-4 bottom-4">
          <div className="rounded-full bg-black/60 px-3 py-1 text-sm text-white">
            {track.duration}
          </div>
        </div>
      </div>
    </Card>
  );
}
