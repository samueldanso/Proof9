"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RegistrationSuccessModal } from "@/components/ui/registration-success-modal";
import { useCreateTrack, useRegisterTrack } from "@/hooks/api";
import { convertLicenseFormToStoryTerms } from "@/lib/utils/story-protocol";
import type { RegistrationRequest, RegistrationResponse } from "@/types/registration";
import type { ImageUploadResponse, MediaUploadResponse } from "@/types/upload";
import { CheckCircle, FileAudio, ImageIcon, Music, Shield, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";
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
  const { address } = useAccount();
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

  // Registration state
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationResult, setRegistrationResult] = useState<RegistrationResponse | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // API hooks
  const registerTrack = useRegisterTrack();
  const createTrack = useCreateTrack();

  const steps = [
    { id: "upload", title: "Upload Files", icon: Upload },
    { id: "metadata", title: "Track Details", icon: FileAudio },
    { id: "verification", title: "AI Verification", icon: CheckCircle },
    { id: "license", title: "License Terms", icon: ImageIcon },
    { id: "complete", title: "Register", icon: Shield },
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
  };

  const handleRegister = async () => {
    if (!metadata || !licenseTerms || !mediaUploadResult || !imageUploadResult || !address) {
      toast.error("Missing required data for registration");
      return;
    }

    setIsRegistering(true);

    try {
      // Prepare registration request
      const registrationRequest: RegistrationRequest = {
        title: metadata.title,
        description: metadata.description,
        creators: metadata.creators,
        image: imageUploadResult.data.image,
        imageHash: imageUploadResult.data.imageHash,
        mediaUrl: mediaUploadResult.data.mediaUrl,
        mediaHash: mediaUploadResult.data.mediaHash,
        mediaType: mediaUploadResult.data.mediaType,
        nftName: metadata.nftName,
        nftDescription: metadata.nftDescription,
        attributes: metadata.attributes,
        commercialRemixTerms: {
          defaultMintingFee: Number(licenseTerms.price),
          commercialRevShare: 5, // Story Protocol standard
        },
      };

      // Register with Story Protocol
      const result = await registerTrack.mutateAsync(registrationRequest);

      if (result.success && result.data) {
        // Create track record in database
        const trackData = {
          title: metadata.title,
          description: metadata.description,
          creators: metadata.creators,
          image: imageUploadResult.data.image,
          imageHash: imageUploadResult.data.imageHash,
          mediaUrl: mediaUploadResult.data.mediaUrl,
          mediaHash: mediaUploadResult.data.mediaHash,
          mediaType: mediaUploadResult.data.mediaType,
          genre: metadata.genre,
          tags: metadata.tags,
          duration: metadata.duration,
          ipId: result.data.ipId,
          tokenId: result.data.tokenId,
          transactionHash: result.data.transactionHash,
          licenseTermsIds: result.data.licenseTermsIds,
          verified: yakoaResult?.verified || false,
          yakoaTokenId: yakoaResult?.tokenId,
        };

        // Save to database
        await createTrack.mutateAsync(trackData);

        setRegistrationResult(result.data);
        setShowSuccessModal(true);
        toast.success("Track registered successfully on Story Protocol!");
      } else {
        throw new Error(result.error || "Registration failed");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.message || "Registration failed. Please try again.");
    } finally {
      setIsRegistering(false);
    }
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
            <div className="space-y-6">
              <div className="space-y-2 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#ced925]/20">
                  <Shield className="h-8 w-8 text-[#ced925]" />
                </div>
                <h2 className="font-bold text-2xl">Register on Story Protocol</h2>
                <p className="text-muted-foreground">
                  Complete your IP registration and mint your license NFT on-chain
                </p>
              </div>

              {/* Registration Summary */}
              <Card className="p-6">
                <h3 className="mb-4 font-semibold text-lg">📋 Registration Summary</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <div>
                      <span className="text-muted-foreground text-sm">Track Title</span>
                      <p className="font-medium">{metadata?.title}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-sm">Creator</span>
                      <p className="font-medium">{metadata?.creators[0]?.name}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-sm">License Type</span>
                      <p className="font-medium capitalize">{licenseTerms?.type}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <span className="text-muted-foreground text-sm">Minting Fee</span>
                      <p className="font-medium">{licenseTerms?.price} WIP</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-sm">Revenue Share</span>
                      <p className="font-medium">5% (Story Protocol Standard)</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-sm">Verification Status</span>
                      <p
                        className={`font-medium ${yakoaResult?.verified ? "text-green-600" : "text-yellow-600"}`}
                      >
                        {yakoaResult?.verified ? "✓ Verified" : "⚠ Review Required"}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Registration Action */}
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleBack} className="flex-1">
                  ← Back to License
                </Button>
                <Button
                  onClick={handleRegister}
                  disabled={isRegistering}
                  className="flex-1 bg-[#ced925] text-black hover:bg-[#b8c220]"
                  size="lg"
                >
                  {isRegistering ? (
                    <>
                      <Shield className="mr-2 h-4 w-4 animate-spin" />
                      Registering on Story Protocol...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Register & Mint License
                    </>
                  )}
                </Button>
              </div>

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

      {/* Registration Success Modal */}
      {registrationResult && (
        <RegistrationSuccessModal
          open={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          data={{
            title: metadata?.title || "Unknown Track",
            type: "track",
            transactionHash: registrationResult.transactionHash,
            ipId: registrationResult.ipId,
            tokenId: registrationResult.tokenId,
            licenseTermsIds: registrationResult.licenseTermsIds,
            explorerUrl: registrationResult.explorerUrl,
            creators: metadata?.creators,
            yakoaVerified: yakoaResult?.verified,
            yakoaTokenId: yakoaResult?.tokenId,
          }}
          onViewProfile={() => {
            setShowSuccessModal(false);
            router.push("/profile");
          }}
          onDiscoverMore={() => {
            setShowSuccessModal(false);
            router.push("/discover");
          }}
          onViewTrack={() => {
            setShowSuccessModal(false);
            router.push(`/track/${registrationResult.ipId}`);
          }}
        />
      )}
    </div>
  );
}
