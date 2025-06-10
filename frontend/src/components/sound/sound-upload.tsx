"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import { Upload, Music, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface SoundUploadProps {
  onUploadComplete?: (file: File) => void;
  maxSize?: number; // in bytes
  acceptedFileTypes?: string[];
}

export function SoundUpload({
  onUploadComplete,
  maxSize = 50 * 1024 * 1024, // 50MB default
  acceptedFileTypes = ["audio/mpeg", "audio/wav", "audio/ogg"],
}: SoundUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const selectedFile = acceptedFiles[0];
      
      if (!selectedFile) return;

      // Validate file size
      if (selectedFile.size > maxSize) {
        toast.error(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
        return;
      }

      // Validate file type
      if (!acceptedFileTypes.includes(selectedFile.type)) {
        toast.error("Invalid file type. Please upload an audio file.");
        return;
      }

      setFile(selectedFile);
    },
    [maxSize, acceptedFileTypes]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': acceptedFileTypes
    },
    maxFiles: 1,
  });

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 500);

    try {
      // TODO: Implement actual file upload logic here
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Simulate upload
      
      onUploadComplete?.(file);
      toast.success("File uploaded successfully!");
    } catch (error) {
      toast.error("Failed to upload file. Please try again.");
    } finally {
      clearInterval(interval);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const removeFile = () => {
    setFile(null);
    setUploadProgress(0);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? "border-primary bg-primary/10" : "border-muted-foreground/25"}
          ${file ? "border-primary" : ""}`}
      >
        <input {...getInputProps()} />
        
        {!file ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              <Upload className="h-12 w-12 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-medium">
                {isDragActive ? "Drop your sound file here" : "Drag & drop your sound file here"}
              </p>
              <p className="text-sm text-muted-foreground">
                or click to browse files
              </p>
              <p className="text-xs text-muted-foreground">
                Supported formats: MP3, WAV, OGG (max {maxSize / (1024 * 1024)}MB)
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Music className="h-8 w-8 text-primary" />
                <div className="text-left">
                  <p className="font-medium truncate max-w-[200px]">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / (1024 * 1024)).toFixed(2)}MB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile();
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {isUploading && (
              <div className="space-y-2">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  Uploading... {uploadProgress}%
                </p>
              </div>
            )}

            {!isUploading && (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpload();
                }}
                className="w-full"
              >
                Upload Sound
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 