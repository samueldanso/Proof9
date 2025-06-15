import { fixIpfsUrl } from "@/lib/utils/ipfs";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseAudioPlayerProps {
  src?: string;
  volume?: number;
  onEnd?: () => void;
  onError?: (error: any) => void;
}

export function useAudioPlayer({ src, volume = 0.75, onEnd, onError }: UseAudioPlayerProps = {}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize audio when src changes
  useEffect(() => {
    if (!src) return;

    // Fix IPFS URLs
    const fixedSrc = fixIpfsUrl(src);

    // Clean up previous audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsLoading(true);
    setError(null);
    setCurrentTime(0);
    setIsPlaying(false);

    // Create new HTML5 Audio element
    const audio = new Audio();
    audio.src = fixedSrc;
    audio.volume = volume;
    audio.preload = "metadata";

    audio.onloadedmetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    audio.onplay = () => {
      setIsPlaying(true);
      // Start progress interval
      intervalRef.current = setInterval(() => {
        setCurrentTime(audio.currentTime);
      }, 100);
    };

    audio.onpause = () => {
      setIsPlaying(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    audio.onended = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      onEnd?.();
    };

    audio.onerror = (e) => {
      const errorMessage = `Failed to load audio file: ${fixedSrc}`;
      setError(errorMessage);
      setIsLoading(false);
      onError?.(e);
    };

    audioRef.current = audio;

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (audio) {
        audio.pause();
        audio.src = "";
      }
    };
  }, [src, onEnd, onError]);

  // Update volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const play = useCallback(() => {
    if (audioRef.current && !isLoading) {
      try {
        audioRef.current.play();
      } catch (error) {
        setError("Failed to play audio");
      }
    }
  }, [isLoading]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  const seek = useCallback(
    (time: number) => {
      if (audioRef.current && duration > 0) {
        const seekTime = Math.max(0, Math.min(time, duration));
        audioRef.current.currentTime = seekTime;
        setCurrentTime(seekTime);
      }
    },
    [duration],
  );

  const setVolume = useCallback((vol: number) => {
    const clampedVolume = Math.max(0, Math.min(1, vol));
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume;
    }
  }, []);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  // Format time helper
  const formatTime = useCallback((timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, []);

  return {
    // State
    isPlaying,
    isLoading,
    duration,
    currentTime,
    error,

    // Controls
    play,
    pause,
    stop,
    seek,
    setVolume,
    togglePlayPause,

    // Helpers
    formatTime,

    // Computed values
    progress: duration > 0 ? (currentTime / duration) * 100 : 0,
  };
}
