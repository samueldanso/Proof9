"use client";

import { useState } from "react";
import { SoundUpload } from "./sound-upload";
import { WaveformVisualizer } from "./waveform-visualizer";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface SoundPreviewProps {
  onUploadComplete?: (file: File) => void;
}

export function SoundPreview({ onUploadComplete }: SoundPreviewProps) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const audioRef = useState<HTMLAudioElement | null>(null);

  const handleUploadComplete = (file: File) => {
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    onUploadComplete?.(file);
  };

  const togglePlay = () => {
    if (!audioRef[0]) return;
    
    if (isPlaying) {
      audioRef[0].pause();
    } else {
      audioRef[0].play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef[0]) {
      audioRef[0].volume = newVolume;
    }
  };

  return (
    <div className="space-y-6">
      <SoundUpload onUploadComplete={handleUploadComplete} />
      
      {audioUrl && (
        <div className="space-y-4">
          <WaveformVisualizer audioUrl={audioUrl} height={120} />
          
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="icon"
              onClick={togglePlay}
              className="h-10 w-10"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            
            <div className="flex items-center space-x-2 flex-1">
              <Volume2 className="h-4 w-4 text-muted-foreground" />
              <Slider
                value={[volume]}
                onValueChange={handleVolumeChange}
                max={1}
                step={0.1}
                className="w-[200px]"
              />
            </div>
          </div>
          
          <audio
            ref={(el) => {
              audioRef[1](el);
              if (el) {
                el.volume = volume;
                el.onended = () => setIsPlaying(false);
              }
            }}
            src={audioUrl}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
} 