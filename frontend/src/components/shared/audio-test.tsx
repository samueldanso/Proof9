"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";

interface AudioTestProps {
  audioUrl: string;
  title?: string;
}

export function AudioTest({ audioUrl, title }: AudioTestProps) {
  const [testResult, setTestResult] = useState<string>("");

  const testAudio = () => {
    setTestResult("Testing...");

    const audio = new Audio();

    audio.onloadedmetadata = () => {
      setTestResult(`✅ Audio loaded! Duration: ${audio.duration.toFixed(2)}s`);
    };

    audio.onerror = (e) => {
      console.error("Audio test error:", e);
      setTestResult(`❌ Failed to load audio`);
    };

    audio.oncanplay = () => {
      setTestResult(`✅ Audio ready to play! Duration: ${audio.duration.toFixed(2)}s`);
    };

    audio.src = audioUrl;
    audio.load();
  };

  return (
    <div className="rounded-lg border bg-muted/50 p-4">
      <h4 className="font-medium mb-2">Audio Test {title && `- ${title}`}</h4>
      <p className="text-muted-foreground text-sm mb-3 break-all">{audioUrl}</p>

      <div className="flex gap-2 items-center">
        <Button size="sm" onClick={testAudio}>Test Audio</Button>
        {testResult && (
          <span className="text-sm">{testResult}</span>
        )}
      </div>

      {/* Basic HTML5 audio for comparison */}
      <audio controls className="mt-3 w-full" preload="metadata">
        <source src={audioUrl} type="audio/mpeg" />
        <source src={audioUrl} type="audio/wav" />
        <source src={audioUrl} type="audio/flac" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}
