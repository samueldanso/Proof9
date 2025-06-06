"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileAudio, Music, Upload } from "lucide-react";
import { useCallback, useState } from "react";

interface UploadFormProps {
  onFileSelect: (file: File) => void;
  onNext: () => void;
}

export default function UploadForm({ onFileSelect, onNext }: UploadFormProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files?.[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files?.[0]) {
      handleFiles(e.target.files);
    }
  }, []);

  const handleFiles = (files: FileList) => {
    const file = files[0];

    // Check if it's an audio file
    if (!file.type.startsWith("audio/")) {
      alert("Please select an audio file (MP3, WAV, FLAC, etc.)");
      return;
    }

    // Check file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      alert("File size must be less than 100MB");
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = () => {
    if (selectedFile) {
      onFileSelect(selectedFile);
      // onNext is called automatically by parent when file is selected
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Number.parseFloat((bytes / k ** i).toFixed(2)) + " " + sizes[i];
  };

  const getAudioDuration = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.onloadedmetadata = () => {
        const duration = audio.duration;
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60);
        resolve(`${minutes}:${seconds.toString().padStart(2, "0")}`);
      };
      audio.src = URL.createObjectURL(file);
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="font-bold text-2xl">Upload Your Audio</h2>
        <p className="text-muted-foreground">
          Select your audio file to begin the protection process
        </p>
      </div>

      {/* File Upload Area */}
      <Card
        className={`relative cursor-pointer transition-all duration-200 ${
          dragActive
            ? "border-primary bg-primary/5"
            : "border-2 border-dashed hover:border-primary/50 hover:bg-accent/50"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="audio/*"
          onChange={handleChange}
          className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
        />

        <div className="flex flex-col items-center justify-center space-y-4 p-12">
          <div className="rounded-full bg-primary/10 p-4">
            <Upload className="h-8 w-8 text-primary" />
          </div>

          <div className="space-y-2 text-center">
            <h3 className="font-semibold">Drop your audio file here</h3>
            <p className="text-muted-foreground text-sm">or click to browse your files</p>
          </div>

          <div className="text-muted-foreground text-xs">
            Supports: MP3, WAV, FLAC, AAC • Max size: 100MB
          </div>
        </div>
      </Card>

      {/* Selected File Preview */}
      {selectedFile && (
        <Card className="p-4">
          <div className="flex items-center space-x-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <FileAudio className="h-6 w-6 text-primary" />
            </div>

            <div className="flex-1 space-y-1">
              <h4 className="font-medium">{selectedFile.name}</h4>
              <div className="flex items-center space-x-4 text-muted-foreground text-sm">
                <span>{formatFileSize(selectedFile.size)}</span>
                <span>•</span>
                <span>{selectedFile.type}</span>
              </div>
            </div>

            <Button onClick={handleUpload} className="bg-primary hover:bg-primary/90">
              Continue →
            </Button>
          </div>
        </Card>
      )}

      {/* Format Guidelines */}
      <div className="rounded-lg border bg-muted/30 p-4">
        <h4 className="mb-3 flex items-center gap-2 font-medium">
          <Music className="h-4 w-4" />
          Audio Guidelines
        </h4>
        <ul className="space-y-1 text-muted-foreground text-sm">
          <li>• High quality audio (44.1kHz or higher recommended)</li>
          <li>• Original compositions only</li>
          <li>• Clear, uncompressed audio preferred</li>
          <li>• Ensure you own full rights to the recording</li>
        </ul>
      </div>
    </div>
  );
}
