import { Howl } from "howler";
import { useCallback, useEffect, useRef, useState } from "react";
import { fixIpfsUrl } from "@/lib/utils/ipfs";

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

  const soundRef = useRef<Howl | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize audio when src changes
  useEffect(() => {
    console.log("🎵 useAudioPlayer - src changed:", src);
    console.log("🎵 useAudioPlayer - src type:", typeof src);
    console.log("🎵 useAudioPlayer - src length:", src?.length);

    if (!src) {
      console.log("❌ useAudioPlayer - No src provided");
      return;
    }

    // Fix IPFS URLs
    const fixedSrc = fixIpfsUrl(src);
    console.log("🔧 useAudioPlayer - Fixed URL:", { original: src, fixed: fixedSrc });

    // Validate src URL
    try {
      new URL(fixedSrc);
      console.log("✅ useAudioPlayer - Valid URL format");
    } catch (error) {
      console.error("❌ useAudioPlayer - Invalid URL format:", error);
      setError("Invalid audio URL format");
      return;
    }

    // Clean up previous sound
    if (soundRef.current) {
      console.log("🧹 useAudioPlayer - Cleaning up previous sound");
      soundRef.current.unload();
      soundRef.current = null;
    }

    setIsLoading(true);
    setError(null);
    setCurrentTime(0);

    console.log("🎵 useAudioPlayer - Creating new Howl instance with src:", fixedSrc);

    // Create new Howl instance
    const sound = new Howl({
      src: [fixedSrc],
      html5: true, // Use HTML5 Audio for better streaming
      preload: "metadata", // Only preload metadata for faster loading
      volume: volume,
      onload: () => {
        console.log("✅ useAudioPlayer - Audio loaded successfully");
        console.log("🎵 useAudioPlayer - Duration:", sound.duration());
        setDuration(sound.duration());
        setIsLoading(false);
      },
      onplay: () => {
        console.log("▶️ useAudioPlayer - Playback started");
        setIsPlaying(true);
        // Start progress interval
        intervalRef.current = setInterval(() => {
          if (sound.playing()) {
            setCurrentTime(sound.seek() as number);
          }
        }, 100);
      },
      onpause: () => {
        console.log("⏸️ useAudioPlayer - Playback paused");
        setIsPlaying(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      },
      onstop: () => {
        console.log("⏹️ useAudioPlayer - Playback stopped");
        setIsPlaying(false);
        setCurrentTime(0);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      },
      onend: () => {
        console.log("🏁 useAudioPlayer - Playback ended");
        setIsPlaying(false);
        setCurrentTime(0);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        onEnd?.();
      },
            onloaderror: (id, error) => {
        console.error("❌ useAudioPlayer - Audio load error:", error);
        console.error("❌ useAudioPlayer - Failed URL:", { original: src, fixed: fixedSrc });
        console.error("❌ useAudioPlayer - Error ID:", id);

        // Check if it's a CORS error
        if (error && typeof error === 'object' && 'code' in error) {
          console.error("❌ useAudioPlayer - Error code:", (error as any).code);
        }

        const errorMessage = `Failed to load audio file: ${fixedSrc}`;
        setError(errorMessage);
        setIsLoading(false);
        onError?.(error);
      },
      onplayerror: (id, error) => {
        console.error("❌ useAudioPlayer - Audio play error:", error);
        console.error("❌ useAudioPlayer - Failed URL:", { original: src, fixed: fixedSrc });
        console.error("❌ useAudioPlayer - Error ID:", id);

        const errorMessage = `Failed to play audio file: ${fixedSrc}`;
        setError(errorMessage);
        setIsPlaying(false);
        onError?.(error);
      },
    });

    soundRef.current = sound;

    return () => {
      console.log("🧹 useAudioPlayer - Cleanup on unmount");
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      sound.unload();
    };
  }, [src, volume, onEnd, onError]);

  // Update volume when it changes
  useEffect(() => {
    if (soundRef.current) {
      console.log("🔊 useAudioPlayer - Volume changed to:", volume);
      soundRef.current.volume(volume);
    }
  }, [volume]);

  const play = useCallback(() => {
    console.log("▶️ useAudioPlayer - Play button clicked");
    console.log("🎵 useAudioPlayer - Current src:", src);
    console.log("🎵 useAudioPlayer - IsLoading:", isLoading);
    console.log("🎵 useAudioPlayer - HasError:", !!error);

    if (soundRef.current && !isLoading) {
      try {
        console.log("✅ useAudioPlayer - Attempting to play");
        soundRef.current.play();
      } catch (error) {
        console.error("❌ useAudioPlayer - Play error:", error);
        setError("Failed to play audio");
      }
    } else {
      console.log("❌ useAudioPlayer - Cannot play:", {
        hasSound: !!soundRef.current,
        isLoading,
        error
      });
    }
  }, [isLoading, error, src]);

  const pause = useCallback(() => {
    console.log("⏸️ useAudioPlayer - Pause button clicked");
    if (soundRef.current) {
      soundRef.current.pause();
    }
  }, []);

  const stop = useCallback(() => {
    console.log("⏹️ useAudioPlayer - Stop button clicked");
    if (soundRef.current) {
      soundRef.current.stop();
    }
  }, []);

  const seek = useCallback(
    (time: number) => {
      console.log("⏭️ useAudioPlayer - Seeking to:", time);
      if (soundRef.current && duration > 0) {
        const seekTime = Math.max(0, Math.min(time, duration));
        soundRef.current.seek(seekTime);
        setCurrentTime(seekTime);
      }
    },
    [duration],
  );

  const setVolume = useCallback((vol: number) => {
    const clampedVolume = Math.max(0, Math.min(1, vol));
    console.log("🔊 useAudioPlayer - Setting volume to:", clampedVolume);
    if (soundRef.current) {
      soundRef.current.volume(clampedVolume);
    }
  }, []);

  const togglePlayPause = useCallback(() => {
    console.log("⏯️ useAudioPlayer - Toggle play/pause, current state:", isPlaying);
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log("🧹 useAudioPlayer - Final cleanup");
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (soundRef.current) {
        soundRef.current.unload();
      }
    };
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
