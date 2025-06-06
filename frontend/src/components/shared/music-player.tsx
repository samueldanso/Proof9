"use client";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Pause, Play, SkipBack, SkipForward, X } from "lucide-react";
import { useEffect, useState } from "react";

interface Track {
  id: string;
  title: string;
  artist: string;
  artistAddress: string;
  duration: string;
  imageUrl?: string;
  audioUrl?: string;
}

interface MusicPlayerProps {
  track: Track | null;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onClose: () => void;
}

export function MusicPlayer({
  track,
  isPlaying,
  onPlay,
  onPause,
  onNext,
  onPrevious,
  onClose,
}: MusicPlayerProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState([0]);

  // Mock progress update - in real app this would come from audio element
  useEffect(() => {
    if (!isPlaying || !track) return;

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        const newTime = prev + 1;
        const newProgress = duration > 0 ? (newTime / duration) * 100 : 0;
        setProgress([newProgress]);
        return newTime < duration ? newTime : duration;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, duration, track]);

  // Set mock duration when track changes
  useEffect(() => {
    if (track) {
      // Convert duration string (e.g., "3:24") to seconds
      const [minutes, seconds] = track.duration.split(":").map(Number);
      setDuration(minutes * 60 + seconds);
      setCurrentTime(0);
      setProgress([0]);
    }
  }, [track]);

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleProgressChange = (value: number[]) => {
    const newTime = (value[0] / 100) * duration;
    setCurrentTime(newTime);
    setProgress(value);
  };

  if (!track) return null;

  return (
    <div className="fixed right-0 bottom-0 left-0 z-50 border-t bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-6xl items-center gap-4">
        {/* Track Info */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-200 dark:bg-neutral-800">
            {track.imageUrl ? (
              <img src={track.imageUrl} alt={track.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-xl">🎵</div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="truncate font-medium text-sm">{track.title}</h4>
            <p className="truncate text-muted-foreground text-xs">{track.artist}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={onPrevious}
              disabled={!onPrevious}
            >
              <SkipBack className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 rounded-full bg-primary p-0 text-primary-foreground hover:bg-primary/90"
              onClick={isPlaying ? onPause : onPlay}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5 fill-current" />
              ) : (
                <Play className="h-5 w-5 fill-current" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={onNext}
              disabled={!onNext}
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="flex w-80 items-center gap-2 text-muted-foreground text-xs">
            <span className="w-10 text-right">{formatTime(currentTime)}</span>
            <Slider
              value={progress}
              onValueChange={handleProgressChange}
              max={100}
              step={0.1}
              className="flex-1"
            />
            <span className="w-10">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
