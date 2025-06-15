"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { ImageUploadResponse, MediaUploadResponse } from "@/types/upload";
import { CheckCircle, FileAudio, ImageIcon, Music, Shield, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import LicenseForm from "./_components/license-form";
import MetadataForm from "./_components/metadata-form";
import UploadForm from "./_components/upload-form";
import UploadProgress from "./_components/upload-progress";

// Story Protocol metadata interface - EXACT NAMING ONLY
interface StoryProtocolMetadata {
  // Story Protocol IPA Standard
  title: string;
  description: string;
  creators: Array<{
    name: string;
    address: string;
    contributionPercent: number;
    description?: string;
    socialMedia?: Array<{
      platform: string;
      url: string;
    }>;
  }>;

  // Story Protocol image.* fields
  image?: string;
  imageHash?: string;

  // Story Protocol media.* fields
  mediaUrl?: string;
  mediaHash?: string;
  mediaType?: string;

  // Additional metadata
  genre: string;
  tags: string[];
  duration?: string;

  // NFT metadata
  nftName?: string;
  nftDescription?: string;
  attributes?: Array<{
    key: string;
    value: string;
  }>;
}

interface LicenseTerms {
  type: string;
  price: string;
  usage: string;
  territory: string;
}

interface YakoaResult {
  verified: boolean;
  confidence: number;
  originality: string;
  tokenId?: string;
  details?: string;
}

type UploadStep = "upload" | "metadata" | "verification" | "license" | "complete";

export default function UploadPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<UploadStep>("upload");
  const [uploadProgress, setUploadProgress] = useState(0);

  // Story Protocol upload data
  const [selectedMediaFile, setSelectedMediaFile] = useState<File | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [mediaUploadResult, setMediaUploadResult] = useState<MediaUploadResponse | null>(null);
  const [imageUploadResult, setImageUploadResult] = useState<ImageUploadResponse | null>(null);

  // Story Protocol metadata
  const [metadata, setMetadata] = useState<StoryProtocolMetadata | null>(null);
  const [licenseTerms, setLicenseTerms] = useState<LicenseTerms | null>(null);
  const [yakoaResult, setYakoaResult] = useState<YakoaResult | null>(null);

  const steps = [
    { id: "upload", title: "Upload Files", icon: Upload },
    { id: "metadata", title: "Track Details", icon: FileAudio },
    { id: "verification", title: "AI Verification", icon: CheckCircle },
    { id: "license", title: "License Terms", icon: ImageIcon },
    { id: "complete", title: "Complete", icon: CheckCircle },
  ];

  const currentStepIndex = steps.findIndex((step) => step.id === currentStep);

  const handleFilesSelect = (
    mediaFile: File,
    imageFile: File,
    uploadData: {
      mediaResult: MediaUploadResponse;
      imageResult: ImageUploadResponse;
    },
  ) => {
    setSelectedMediaFile(mediaFile);
    setSelectedImageFile(imageFile);
    setMediaUploadResult(uploadData.mediaResult);
    setImageUploadResult(uploadData.imageResult);
    setCurrentStep("metadata");
    toast.success("Files uploaded successfully!");
  };

  const handleMetadataSubmit = (metadataData: StoryProtocolMetadata) => {
    setMetadata(metadataData);
    setCurrentStep("verification");
    toast.success("Metadata saved!");
  };

  const handleVerificationComplete = (result: YakoaResult) => {
    setYakoaResult(result);
    setCurrentStep("license");
    toast.success("Verification complete!");
  };

  const handleLicenseSubmit = (license: LicenseTerms) => {
    setLicenseTerms(license);
    setCurrentStep("complete");
    toast.success("Upload process complete!");
  };

  const handleStepClick = (stepId: string) => {
    const stepIndex = steps.findIndex((step) => step.id === stepId);
    if (stepIndex <= currentStepIndex) {
      setCurrentStep(stepId as UploadStep);
    }
  };

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].id as UploadStep);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id as UploadStep);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2 text-center">
          <h1 className="font-bold text-3xl">Upload Your Track</h1>
          <p className="text-muted-foreground">
            Protect your music with Story Protocol and verify authenticity with AI
          </p>
        </div>

        {/* Progress Steps */}
        <div className="relative">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const isActive = step.id === currentStep;
              const isCompleted = index < currentStepIndex;
              const isClickable = index <= currentStepIndex;

              return (
                <div key={step.id} className="flex flex-col items-center space-y-2">
                  <button
                    type="button"
                    onClick={() => isClickable && handleStepClick(step.id)}
                    disabled={!isClickable}
                    className={`relative flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all ${
                      isActive
                        ? "border-[#ced925] bg-[#ced925] text-black"
                        : isCompleted
                          ? "border-green-500 bg-green-500 text-white"
                          : "border-muted bg-background text-muted-foreground"
                    } ${isClickable ? "cursor-pointer hover:scale-105" : "cursor-not-allowed"}`}
                  >
                    <step.icon className="h-5 w-5" />
                  </button>
                  <span
                    className={`font-medium text-sm ${
                      isActive
                        ? "text-[#ced925]"
                        : isCompleted
                          ? "text-green-600"
                          : "text-muted-foreground"
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Progress Line */}
          <div className="-z-10 absolute top-6 right-6 left-6 h-0.5 bg-muted">
            <div
              className="h-full bg-[#ced925] transition-all duration-500"
              style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <Card className="p-8">
          {currentStep === "upload" && (
            <UploadForm onFilesSelect={handleFilesSelect} onNext={handleNext} />
          )}

          {currentStep === "metadata" && (
            <MetadataForm
              mediaFile={selectedMediaFile || undefined}
              imageFile={selectedImageFile || undefined}
              mediaResult={
                mediaUploadResult?.data
                  ? {
                      mediaUrl: mediaUploadResult.data.mediaUrl,
                      mediaHash: mediaUploadResult.data.mediaHash,
                      mediaType: mediaUploadResult.data.mediaType,
                    }
                  : undefined
              }
              imageResult={
                imageUploadResult?.data
                  ? {
                      image: imageUploadResult.data.image,
                      imageHash: imageUploadResult.data.imageHash,
                    }
                  : undefined
              }
              onSubmit={handleMetadataSubmit}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {currentStep === "verification" && (
            <UploadProgress
              file={selectedMediaFile || undefined}
              uploadInfo={
                mediaUploadResult?.data
                  ? {
                      ipfsHash: mediaUploadResult.data.mediaHash,
                      ipfsUrl: mediaUploadResult.data.mediaUrl,
                      fileHash: mediaUploadResult.data.mediaHash,
                    }
                  : undefined
              }
              metadata={
                metadata
                  ? {
                      title: metadata.title,
                      description: metadata.description,
                      genre: metadata.genre,
                      tags: metadata.tags,
                    }
                  : undefined
              }
              license={licenseTerms || undefined}
              onVerificationComplete={handleVerificationComplete}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {currentStep === "license" && (
            <LicenseForm onSubmit={handleLicenseSubmit} onNext={handleNext} onBack={handleBack} />
          )}

          {currentStep === "complete" && (
            <div className="space-y-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>

              <div className="space-y-2">
                <h2 className="font-bold text-2xl">Upload Complete!</h2>
                <p className="text-muted-foreground">
                  Your track has been successfully uploaded and protected with Story Protocol
                </p>
              </div>

              {/* Story Protocol Summary */}
              <Card className="p-6 text-left">
                <h3 className="mb-4 font-semibold text-lg">Story Protocol Registration Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Track Title:</span>
                    <span className="font-medium">{metadata?.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Creator:</span>
                    <span className="font-medium">{metadata?.creators[0]?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Media URL:</span>
                    <span className="break-all font-mono text-xs">{metadata?.mediaUrl}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Image URL:</span>
                    <span className="break-all font-mono text-xs">{metadata?.image}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Verification Status:</span>
                    <span className={yakoaResult?.verified ? "text-green-600" : "text-yellow-600"}>
                      {yakoaResult?.verified ? "✓ Verified" : "⚠ Review Required"}
                    </span>
                  </div>
                </div>
              </Card>

              <div className="flex justify-center gap-4">
                <Button onClick={() => router.push("/discover")}>Explore Tracks</Button>
                <Button variant="outline" onClick={() => router.push("/library")}>
                  View Library
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
