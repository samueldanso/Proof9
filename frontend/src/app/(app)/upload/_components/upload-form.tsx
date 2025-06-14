"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useUploadImage, useUploadMedia } from "@/hooks/api";
import type { ImageUploadResponse, MediaUploadResponse } from "@/types/upload";
import { FileAudio, ImageIcon, Music, Upload } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

interface UploadFormProps {
  onFilesSelect: (
    mediaFile: File,
    imageFile: File,
    uploadData: {
      mediaResult: MediaUploadResponse;
      imageResult: ImageUploadResponse;
    },
  ) => void;
  onNext: () => void;
}

export default function UploadForm({ onFilesSelect, onNext }: UploadFormProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<File | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const mediaInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // API hooks - Story Protocol naming
  const uploadMediaMutation = useUploadMedia();
  const uploadImageMutation = useUploadImage();

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
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("audio/")) {
        handleMediaFile(file);
      } else if (file.type.startsWith("image/")) {
        handleImageFile(file);
      } else {
        toast.error("Please drop an audio or image file");
      }
    }
  }, []);

  const handleMediaChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files?.[0]) {
      handleMediaFile(e.target.files[0]);
    }
  }, []);

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files?.[0]) {
      handleImageFile(e.target.files[0]);
    }
  }, []);

  const handleMediaFile = (file: File) => {
    // Check if it's an audio file
    if (!file.type.startsWith("audio/")) {
      toast.error("Please select an audio file (MP3, WAV, FLAC, etc.)");
      return;
    }

    // Check file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      toast.error("Audio file size must be less than 100MB");
      return;
    }

    setSelectedMedia(file);
    toast.success("Audio file selected");
  };

  const handleImageFile = (file: File) => {
    // Check if it's an image file
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file (JPG, PNG, WebP, etc.)");
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size must be less than 10MB");
      return;
    }

    // Create preview
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setSelectedImage(file);
    toast.success("Cover image selected");
  };

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        // Remove data:xxx;base64, prefix
        const base64Data = base64.split(",")[1];
        resolve(base64Data);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleUpload = async () => {
    if (!selectedMedia || !selectedImage) {
      toast.error("Please select both audio file and cover image");
      return;
    }

    setIsUploading(true);

    try {
      // Convert files to base64
      const mediaData = await fileToBase64(selectedMedia);
      const imageData = await fileToBase64(selectedImage);

      // Upload both files in parallel using Story Protocol naming
      const [mediaResult, imageResult] = await Promise.all([
        uploadMediaMutation.mutateAsync({
          mediaName: selectedMedia.name,
          mediaType: selectedMedia.type,
          mediaSize: selectedMedia.size,
          mediaData: mediaData,
        }),
        uploadImageMutation.mutateAsync({
          imageName: selectedImage.name,
          imageType: selectedImage.type,
          imageSize: selectedImage.size,
          imageData: imageData,
        }),
      ]);

      toast.success("Files uploaded successfully!");

      // Pass files and results with Story Protocol naming
      if (mediaResult.data && imageResult.data) {
        onFilesSelect(selectedMedia, selectedImage, {
          mediaResult: mediaResult,
          imageResult: imageResult,
        });
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Number.parseFloat((bytes / k ** i).toFixed(2)) + " " + sizes[i];
  };

  const canUpload = selectedMedia && selectedImage && !isUploading;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="font-bold text-2xl">Upload Your Media</h2>
        <p className="text-muted-foreground">
          Select your audio file and cover image to begin the protection process
        </p>
      </div>

      {/* File Upload Area - More Compact */}
      <Card
        className={`relative cursor-pointer transition-all duration-200 ${
          selectedMedia && selectedImage
            ? "border-2 border-[#ced925] bg-[#ced925]/5"
            : dragActive
              ? "border-[#ced925] bg-[#ced925]/5"
              : "border-2 border-dashed hover:border-[#ced925]/50 hover:bg-accent/50"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={mediaInputRef}
          type="file"
          accept="audio/*"
          onChange={handleMediaChange}
          className="hidden"
          disabled={isUploading}
        />
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
          disabled={isUploading}
        />

        {selectedMedia && selectedImage ? (
          // Show both files selected
          <div className="p-6">
            <div className="flex items-center justify-center space-x-6">
              {/* Audio File */}
              <div className="flex flex-col items-center space-y-3">
                <div className="rounded-full bg-[#ced925]/20 p-3">
                  <FileAudio className="h-6 w-6 text-[#ced925]" />
                </div>
                <div className="text-center">
                  <h4 className="font-medium text-sm">{selectedMedia.name}</h4>
                  <p className="text-muted-foreground text-xs">
                    {formatFileSize(selectedMedia.size)} • {selectedMedia.type.split("/")[1]}
                  </p>
                </div>
              </div>

              {/* Cover Image */}
              <div className="flex flex-col items-center space-y-3">
                <div className="h-16 w-16 overflow-hidden rounded-lg">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Cover preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#ced925]/10">
                      <ImageIcon className="h-6 w-6 text-[#ced925]" />
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <h4 className="font-medium text-sm">{selectedImage.name}</h4>
                  <p className="text-muted-foreground text-xs">
                    {formatFileSize(selectedImage.size)} • {selectedImage.type.split("/")[1]}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Show upload prompt
          <div className="p-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="flex items-center space-x-4">
                <div className="rounded-full bg-[#ced925]/10 p-3">
                  <FileAudio className="h-6 w-6 text-[#ced925]" />
                </div>
                <div className="rounded-full bg-[#ced925]/10 p-3">
                  <ImageIcon className="h-6 w-6 text-[#ced925]" />
                </div>
              </div>

              <div className="space-y-2 text-center">
                <h3 className="font-semibold">Upload Audio + Cover Image</h3>
                <p className="text-muted-foreground text-sm">
                  Drop your files here or click to browse
                </p>
              </div>

              <div className="flex space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => mediaInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <FileAudio className="mr-2 h-4 w-4" />
                  Select Audio
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Select Image
                </Button>
              </div>

              <div className="text-muted-foreground text-xs">
                Audio: MP3, WAV, FLAC • Max 100MB | Image: JPG, PNG, WebP • Max 10MB
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Preview & Controls */}
      {selectedMedia && selectedImage && (
        <Card className="p-6">
          <div className="space-y-4">
            <h4 className="font-medium">Media Preview</h4>

            <div className="flex items-start space-x-4">
              {/* Cover Art */}
              <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
                {imagePreview ? (
                  <img src={imagePreview} alt="Cover art" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Audio Player */}
              <div className="flex-1">
                <audio controls className="w-full" preload="metadata">
                  <source src={URL.createObjectURL(selectedMedia)} type={selectedMedia.type} />
                  <track kind="captions" label="Music Preview" default />
                  Your browser does not support the audio element.
                </audio>
              </div>
            </div>

            {/* Continue Button */}
            <Button
              onClick={handleUpload}
              disabled={!canUpload}
              className="w-full bg-[#ced925] text-black hover:bg-[#b8c220] disabled:opacity-50"
              size="lg"
            >
              {isUploading ? "Uploading..." : "Continue →"}
            </Button>
          </div>
        </Card>
      )}

      {/* Format Guidelines */}
      <div className="rounded-lg border bg-muted/30 p-4">
        <h4 className="mb-3 flex items-center gap-2 font-medium">
          <Music className="h-4 w-4" />
          Upload Guidelines
        </h4>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <h5 className="font-medium text-sm">Audio Requirements</h5>
            <ul className="mt-1 space-y-1 text-muted-foreground text-xs">
              <li>• High quality (44.1kHz+)</li>
              <li>• Original compositions only</li>
              <li>• MP3, WAV, FLAC formats</li>
              <li>• Maximum 100MB</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-sm">Cover Art Requirements</h5>
            <ul className="mt-1 space-y-1 text-muted-foreground text-xs">
              <li>• Square aspect ratio preferred</li>
              <li>• High resolution (1000x1000+)</li>
              <li>• JPG, PNG, WebP formats</li>
              <li>• Maximum 10MB</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
