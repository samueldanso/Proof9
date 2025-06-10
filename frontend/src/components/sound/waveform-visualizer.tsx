"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface WaveformVisualizerProps {
  audioUrl: string;
  height?: number;
  color?: string;
  backgroundColor?: string;
}

export function WaveformVisualizer({
  audioUrl,
  height = 100,
  color = "rgb(var(--primary))",
  backgroundColor = "rgb(var(--background))",
}: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const audio = new Audio(audioUrl);
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaElementSource(audio);

    source.connect(analyser);
    analyser.connect(audioContext.destination);

    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * height;

        ctx.fillStyle = color;
        ctx.fillRect(
          x,
          (height - barHeight) / 2,
          barWidth,
          barHeight
        );

        x += barWidth + 1;
      }
    };

    audio.addEventListener("canplaythrough", () => {
      setIsLoading(false);
      draw();
    });

    audio.addEventListener("error", () => {
      setError("Failed to load audio file");
      setIsLoading(false);
    });

    return () => {
      audio.pause();
      audioContext.close();
    };
  }, [audioUrl, height, color, backgroundColor]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-[100px] text-destructive">
        {error}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[100px]">
        <div className="animate-pulse bg-muted h-full w-full rounded-lg" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full overflow-hidden rounded-lg"
      style={{ height }}
    >
      <canvas
        ref={canvasRef}
        width={800}
        height={height}
        className="w-full h-full"
      />
    </motion.div>
  );
} 