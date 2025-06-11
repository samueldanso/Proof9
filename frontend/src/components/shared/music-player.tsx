"use client";

import IconBubble from "@/components/icons/bubble.svg";
import IconHeart from "@/components/icons/hearth.svg";
import IconHeartFill from "@/components/icons/hearthFill.svg";
import IconShare from "@/components/icons/share.svg";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useAudioPlayer } from "@/hooks/use-audio-player";
import { getAvatarUrl, getUserInitials } from "@/lib/avatar";
import { getCoverPlaceholder, getCoverUrl } from "@/lib/cover";
import { Loader2, Pause, Play, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { useState } from "react";

interface Track {
  id: string;
  title: string;
  artist: string;
  artistAddress: string;
  duration: string;
  imageUrl?: string;
  audioUrl?: string;
  isLiked?: boolean;
  genre?: string;
  artistAvatarUrl?: string;
}

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
  const [volume, setVolume] = useState(75);

  // Use real audio player
  const {
    isPlaying: audioIsPlaying,
    isLoading,
    duration,
    currentTime,
    error,
    play,
    pause,
    seek,
    setVolume: setAudioVolume,
    formatTime,
    progress,
  } = useAudioPlayer({
    src: track.audioUrl,
    volume: volume / 100,
    onEnd: () => {
      onPause();
    },
    onError: (error) => {
      console.error("Audio playback error:", error);
    },
  });

  // Sync external play/pause state with audio
  const handlePlayPause = () => {
    if (audioIsPlaying) {
      pause();
      onPause();
    } else {
      play();
      onPlay();
    }
  };

  // Handle seeking
  const handleSeek = (value: number[]) => {
    const seekTime = (value[0] / 100) * duration;
    seek(seekTime);
  };

  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    setAudioVolume(newVolume / 100);
  };

  return (
    <div className="fixed right-0 bottom-0 left-0 z-50 border-border border-t bg-background p-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        {/* Left: Track Info */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {/* Track Cover */}
          <div className="size-14 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
            <img
              src={getCoverUrl(track.imageUrl, track.genre)}
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
            <div className="truncate font-medium text-sm">{track.title}</div>
            <div className="mt-1 flex items-center gap-2">
              <Avatar className="size-4">
                <AvatarImage src={getAvatarUrl(track.artistAvatarUrl)} />
                <AvatarFallback className="text-xs">{getUserInitials(track.artist)}</AvatarFallback>
              </Avatar>
              <span className="truncate text-muted-foreground text-xs">{track.artist}</span>
            </div>
          </div>
        </div>

        {/* Center: Playback Controls */}
        <div className="flex max-w-md flex-1 flex-col items-center gap-2">
          {/* Controls */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="size-8 p-0">
              <SkipBack className="size-4" />
            </Button>

            <Button
              variant="default"
              size="sm"
              className="size-10 rounded-full bg-[#ced925] p-0 text-black hover:bg-[#b8c220]"
              onClick={handlePlayPause}
              disabled={!!(isLoading || error)}
            >
              {isLoading ? (
                <Loader2 className="size-5 animate-spin" />
              ) : audioIsPlaying ? (
                <Pause className="size-5" />
              ) : (
                <Play className="ml-0.5 size-5" />
              )}
            </Button>

            <Button variant="ghost" size="sm" className="size-8 p-0">
              <SkipForward className="size-4" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="flex w-full items-center gap-2">
            <span className="min-w-[35px] text-muted-foreground text-xs">
              {formatTime(currentTime)}
            </span>
            <Slider
              value={[progress]}
              onValueChange={handleSeek}
              max={100}
              step={0.1}
              className="flex-1"
              disabled={!!(isLoading || error || duration === 0)}
            />
            <span className="min-w-[35px] text-muted-foreground text-xs">
              {duration > 0 ? formatTime(duration) : track.duration || "0:00"}
            </span>
          </div>

          {/* Error Display */}
          {error && <div className="text-center text-red-500 text-xs">{error}</div>}
        </div>

        {/* Right: Social Actions & Volume */}
        <div className="flex flex-1 items-center justify-end gap-3">
          {/* Social Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="size-8 p-0"
              onClick={() => onLike?.(track.id)}
            >
              {track.isLiked ? (
                <IconHeartFill className="size-4 text-red-500" />
              ) : (
                <IconHeart className="size-4" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="size-8 p-0"
              onClick={() => onComment?.(track.id)}
            >
              <IconBubble className="size-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="size-8 p-0"
              onClick={() => onShare?.(track.id)}
            >
              <IconShare className="size-4" />
            </Button>
          </div>

          {/* Volume Control */}
          <div className="flex min-w-[120px] items-center gap-2">
            <Volume2 className="size-4 text-muted-foreground" />
            <Slider
              value={[volume]}
              onValueChange={handleVolumeChange}
              max={100}
              step={1}
              className="w-20"
            />
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
