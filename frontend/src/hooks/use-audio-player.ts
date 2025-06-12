import { Howl } from "howler";
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

  const soundRef = useRef<Howl | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize audio when src changes
  useEffect(() => {
    console.log("useAudioPlayer - src changed:", src);

    if (!src) {
      console.log("useAudioPlayer - No src provided");
      return;
    }

    // Clean up previous sound
    if (soundRef.current) {
      soundRef.current.unload();
      soundRef.current = null;
    }

    setIsLoading(true);
    setError(null);
    setCurrentTime(0);

    // Create new Howl instance
    const sound = new Howl({
      src: [src],
      html5: true, // Use HTML5 Audio for better streaming
      preload: "metadata", // Only preload metadata for faster loading
      volume: volume,
      onload: () => {
        setDuration(sound.duration());
        setIsLoading(false);
      },
      onplay: () => {
        setIsPlaying(true);
        // Start progress interval
        intervalRef.current = setInterval(() => {
          if (sound.playing()) {
            setCurrentTime(sound.seek() as number);
          }
        }, 100);
      },
      onpause: () => {
        setIsPlaying(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      },
      onstop: () => {
        setIsPlaying(false);
        setCurrentTime(0);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      },
      onend: () => {
        setIsPlaying(false);
        setCurrentTime(0);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        onEnd?.();
      },
      onloaderror: (id, error) => {
        console.error("Audio load error:", error);
        console.error("Audio URL that failed:", src);
        setError("Failed to load audio file");
        setIsLoading(false);
        onError?.(error);
      },
      onplayerror: (id, error) => {
        console.error("Audio play error:", error);
        console.error("Audio URL that failed:", src);
        setError("Failed to play audio file");
        setIsPlaying(false);
        onError?.(error);
      },
    });

    soundRef.current = sound;

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      sound.unload();
    };
  }, [src, volume, onEnd, onError]);

  // Update volume when it changes
  useEffect(() => {
    if (soundRef.current) {
      soundRef.current.volume(volume);
    }
  }, [volume]);

  const play = useCallback(() => {
    if (soundRef.current && !isLoading) {
      try {
        soundRef.current.play();
      } catch (error) {
        console.error("Play error:", error);
        setError("Failed to play audio");
      }
    }
  }, [isLoading]);

  const pause = useCallback(() => {
    if (soundRef.current) {
      soundRef.current.pause();
    }
  }, []);

  const stop = useCallback(() => {
    if (soundRef.current) {
      soundRef.current.stop();
    }
  }, []);

  const seek = useCallback(
    (time: number) => {
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
    if (soundRef.current) {
      soundRef.current.volume(clampedVolume);
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
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
