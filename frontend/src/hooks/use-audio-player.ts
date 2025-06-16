import { getAllIpfsGatewayUrls, fixIpfsUrl } from "@/lib/utils/ipfs";
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
  const gatewayIndexRef = useRef(0);
  const gatewayUrlsRef = useRef<string[]>([]);

  // Initialize audio when src changes
  useEffect(() => {
    if (!src) {
      console.log("🎵 No audio source provided");
      return;
    }

    // Get all possible IPFS gateway URLs
    gatewayUrlsRef.current = getAllIpfsGatewayUrls(src);
    gatewayIndexRef.current = 0;

    if (gatewayUrlsRef.current.length === 0) {
      // Fallback to original URL if no IPFS URLs found
      gatewayUrlsRef.current = [src];
    }

    console.log("🎵 Audio source gateways:", gatewayUrlsRef.current);

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

    // Try loading audio with current gateway
    const tryLoadAudio = () => {
      const currentUrl = gatewayUrlsRef.current[gatewayIndexRef.current];
      console.log(`🎵 Trying gateway ${gatewayIndexRef.current + 1}/${gatewayUrlsRef.current.length}: ${currentUrl}`);

      // Create new HTML5 Audio element
      const audio = new Audio();
      audio.src = currentUrl;
      audio.volume = volume;
      audio.preload = "metadata";
      audio.crossOrigin = "anonymous"; // Try to handle CORS

    audio.onloadstart = () => {
      console.log("🎵 Audio loading started");
    };

    audio.onloadedmetadata = () => {
      console.log("🎵 Audio metadata loaded:", { duration: audio.duration });
      setDuration(audio.duration);
      setIsLoading(false);
    };

    audio.oncanplay = () => {
      console.log("🎵 Audio can start playing");
    };

    audio.onplay = () => {
      console.log("🎵 Audio started playing");
      setIsPlaying(true);
      // Start progress interval
      intervalRef.current = setInterval(() => {
        setCurrentTime(audio.currentTime);
      }, 100);
    };

    audio.onpause = () => {
      console.log("🎵 Audio paused");
      setIsPlaying(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    audio.onended = () => {
      console.log("🎵 Audio ended");
      setIsPlaying(false);
      setCurrentTime(0);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      onEnd?.();
    };

          audio.onerror = (e) => {
        console.error(`🎵 Audio error on gateway ${gatewayIndexRef.current + 1}:`, e);
        console.error("🎵 Audio error details:", {
          error: audio.error,
          networkState: audio.networkState,
          readyState: audio.readyState,
          src: currentUrl
        });

        // Try next gateway
        gatewayIndexRef.current++;
        if (gatewayIndexRef.current < gatewayUrlsRef.current.length) {
          console.log(`🎵 Trying next gateway...`);
          tryLoadAudio();
          return;
        }

        // All gateways failed
        let errorMessage = "Failed to load audio from all gateways";

        if (audio.error) {
          switch (audio.error.code) {
            case MediaError.MEDIA_ERR_ABORTED:
              errorMessage = "Audio loading was aborted";
              break;
            case MediaError.MEDIA_ERR_NETWORK:
              errorMessage = "Network error - all IPFS gateways failed";
              break;
            case MediaError.MEDIA_ERR_DECODE:
              errorMessage = "Audio format not supported";
              break;
            case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
              errorMessage = "Audio source not supported";
              break;
            default:
              errorMessage = "All IPFS gateways failed";
          }
        }

        console.error("🎵 All gateways failed:", errorMessage);
        setError(errorMessage);
        setIsLoading(false);
        onError?.(e);
      };

      audioRef.current = audio;
    };

    // Start trying to load audio
    tryLoadAudio();

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
      console.log("🎵 Attempting to play audio");
      try {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error("🎵 Play failed:", error);
            setError("Playback failed - " + error.message);
          });
        }
      } catch (error) {
        console.error("🎵 Play error:", error);
        setError("Failed to play audio");
      }
    } else {
      console.log("🎵 Cannot play - audio not ready or loading");
    }
  }, [isLoading]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      console.log("🎵 Pausing audio");
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
