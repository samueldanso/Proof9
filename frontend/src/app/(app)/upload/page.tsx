"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { env } from "@/env";
import { apiClient } from "@/lib/api/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import LicenseForm from "./_components/license-form";
import MetadataForm from "./_components/metadata-form";
import UploadForm from "./_components/upload-form";
import UploadProgress from "./_components/upload-progress";

// Import the complete YakoaResult type
interface YakoaResult {
  verified: boolean;
  confidence: number;
  originality: string;
  tokenId?: string;
  details?: string;
  infringementDetails?: {
    status: string;
    result: string;
    externalInfringements: Array<{
      brand_id: string;
      brand_name: string;
      confidence: number;
      authorized: boolean;
    }>;
    inNetworkInfringements: Array<{
      token_id: string;
      confidence: number;
      licensed: boolean;
    }>;
  };
}

interface UploadData {
  file?: File;
  uploadInfo?: {
    ipfsHash: string;
    ipfsUrl: string;
    fileHash: string;
  };
  metadata?: {
    title: string;
    description: string;
    genre: string;
    tags: string[];
  };
  license?: {
    type: string;
    price: string;
    usage: string;
    territory: string;
  };
  yakoa?: YakoaResult; // Use the complete YakoaResult type
}

const steps = [
  { id: 1, title: "Upload", description: "Select your audio file" },
  { id: 2, title: "Details", description: "Add track information" },
  { id: 3, title: "License", description: "Set usage terms" },
  { id: 4, title: "Verify & Register", description: "AI check & blockchain" },
];

export default function UploadPage() {
  const { address } = useAccount();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadData, setUploadData] = useState<UploadData>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const updateUploadData = (stepData: Partial<UploadData>) => {
    setUploadData((prev) => ({ ...prev, ...stepData }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <UploadForm
            onFileSelect={(file, uploadData) => {
              updateUploadData({ file, uploadInfo: uploadData });
              nextStep();
            }}
            onNext={nextStep}
          />
        );
      case 2:
        return (
          <MetadataForm
            initialData={uploadData.metadata}
            onSubmit={(metadata) => {
              updateUploadData({ metadata });
              nextStep();
            }}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 3:
        return (
          <LicenseForm
            initialData={uploadData.license}
            onSubmit={(license) => {
              updateUploadData({ license });
              nextStep();
            }}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 4:
        return (
          <UploadProgress
            file={uploadData.file}
            uploadInfo={uploadData.uploadInfo}
            metadata={uploadData.metadata}
            license={uploadData.license}
            onVerificationComplete={(yakoaResult) => {
              updateUploadData({ yakoa: yakoaResult });
              // After verification, proceed to final registration
              handleFinalRegistration();
            }}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      default:
        return null;
    }
  };

  const handleFinalRegistration = async () => {
    if (!address) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsProcessing(true);

    try {
      // Step 1: Create track in database using API client
      const trackResult = await apiClient.post<{
        success: boolean;
        data: any;
        error?: string;
      }>("/api/tracks", {
        title: uploadData.metadata?.title,
        description: uploadData.metadata?.description,
        genre: uploadData.metadata?.genre,
        tags: uploadData.metadata?.tags,
        artist_address: address,
        ipfs_hash: uploadData.uploadInfo?.ipfsHash,
        ipfs_url: uploadData.uploadInfo?.ipfsUrl,
        file_hash: uploadData.uploadInfo?.fileHash,
        verified: uploadData.yakoa?.verified || false,
      });

      if (!trackResult.success) {
        throw new Error("Failed to create track");
      }

      // Step 2: Register with Story Protocol
      if (uploadData.yakoa?.verified) {
        console.log("🚀 Starting Story Protocol registration...");

        // Generate proper hashes for Story Protocol (as per tutorial)
        const imageHash = `0x${uploadData.uploadInfo?.fileHash || ""}`; // Use existing file hash
        const mediaHash = `0x${uploadData.uploadInfo?.fileHash || ""}`; // Use existing file hash

        const registrationResult = await apiClient.post<{
          success: boolean;
          data: any;
          error?: string;
        }>("/api/registration/register", {
          ipMetadata: {
            title: uploadData.metadata?.title,
            description: uploadData.metadata?.description,
            creators: [
              {
                name: "Creator",
                address: address,
                contributionPercent: 100,
              },
            ],
            image: uploadData.uploadInfo?.ipfsUrl || "",
            imageHash: imageHash,
            mediaUrl: uploadData.uploadInfo?.ipfsUrl,
            mediaHash: mediaHash,
            mediaType: "audio/mpeg", // Specific media type as per tutorial
          },
          nftMetadata: {
            name: uploadData.metadata?.title,
            description: `${uploadData.metadata?.description}. This NFT represents ownership of the IP Asset.`,
            image: uploadData.uploadInfo?.ipfsUrl || "",
            animation_url: uploadData.uploadInfo?.ipfsUrl, // Add animation_url for audio
            attributes: [
              {
                key: "Yakoa Verified",
                value: uploadData.yakoa?.verified ? "Yes" : "No",
              },
              {
                key: "Yakoa Token ID",
                value: uploadData.yakoa?.tokenId || "Unknown",
              },
              {
                key: "Genre",
                value: uploadData.metadata?.genre || "Unknown",
              },
              {
                key: "License Type",
                value: uploadData.license?.type || "Unknown",
              },
              {
                key: "Platform",
                value: "Proof9",
              },
              ...(uploadData.metadata?.tags?.map((tag) => ({
                key: "Tag",
                value: tag,
              })) || []),
            ],
          },
        });

        console.log("📋 Story Protocol result:", registrationResult);

        if (registrationResult.success) {
          toast.success("Track registered successfully on Story Protocol!");
          console.log(
            "✅ Story Protocol registration:",
            registrationResult.data
          );
        } else {
          console.error("❌ Story Protocol error:", registrationResult.error);
          toast.error(
            `Story Protocol registration failed: ${registrationResult.error}`
          );
        }
      } else {
        console.log(
          "⚠️ Skipping Story Protocol registration - content not verified"
        );
        toast.info(
          "Track uploaded successfully (Story Protocol registration skipped for unverified content)"
        );
      }

      toast.success("Track uploaded successfully!");
      router.push(`/profile/${address}`);
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error("Failed to register track. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* Header - Centered like profile page */}
      <div className="mx-auto max-w-2xl space-y-2 text-center">
        <h1 className="font-bold text-3xl">Upload Your Sound</h1>
        <p className="text-muted-foreground">
          Protect your IP with AI verification and blockchain registration
        </p>
      </div>

      {/* Progress and Content - Left aligned */}
      <div className="max-w-4xl space-y-6">
        {/* Progress Indicator */}
        <div className="space-y-4">
          <Progress
            value={(currentStep / steps.length) * 100}
            className="h-2 [&>div]:bg-primary"
          />
          <div className="flex justify-between text-sm">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex flex-col items-center space-y-1 ${
                  currentStep >= step.id
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full font-medium text-xs ${
                    currentStep >= step.id
                      ? "bg-primary text-black"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step.id}
                </div>
                <span className="font-medium">{step.title}</span>
                <span className="text-xs">{step.description}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card>
          <CardContent className="p-8">{renderStepContent()}</CardContent>
        </Card>
      </div>
    </div>
  );
}
