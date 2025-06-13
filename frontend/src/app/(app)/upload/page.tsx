"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RegistrationSuccessModal } from "@/components/ui/registration-success-modal";
import { env } from "@/env";
import { useCreateTrack, useRegisterDerivative, useRegisterTrack } from "@/hooks/api";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
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
  // Story Protocol compliant metadata
  metadata?: {
    // === IP METADATA (Story Protocol IPA Standard) ===
    title: string;
    description: string;

    // Story Protocol creators array
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

    // Cover art (Story Protocol image.* fields)
    coverArt?: File;
    imageUrl?: string;
    imageHash?: string;

    // Audio file (Story Protocol media.* fields)
    mediaUrl?: string;
    mediaHash?: string;
    mediaType?: string;

    // === NFT METADATA (ERC-721 Standard) ===
    nftName?: string;
    nftDescription?: string;
    attributes?: Array<{
      key: string;
      value: string;
    }>;

    // === ADDITIONAL METADATA (Platform-specific) ===
    genre: string;
    tags: string[];
    duration?: string;
  };
  license?: {
    type: string;
    price: string;
    usage: string;
    territory: string;
  };
  yakoa?: YakoaResult; // Use the complete YakoaResult type
  remix?: {
    isRemix: boolean;
    parentTrackId?: string;
    parentIpId?: string;
    parentTitle?: string;
  };
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
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadData, setUploadData] = useState<UploadData>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registrationResult, setRegistrationResult] = useState<any>(null);

  // Use hooks for API calls
  const createTrackMutation = useCreateTrack();
  const registerTrackMutation = useRegisterTrack();
  const registerDerivativeMutation = useRegisterDerivative();

  // Check for remix parameters on mount
  useEffect(() => {
    const isRemix = searchParams.get("remix") === "true";
    if (isRemix) {
      const parentTrackId = searchParams.get("parentTrackId");
      const parentIpId = searchParams.get("parentIpId");
      const parentTitle = searchParams.get("parentTitle");

      setUploadData((prev) => ({
        ...prev,
        remix: {
          isRemix: true,
          parentTrackId: parentTrackId || undefined,
          parentIpId: parentIpId || undefined,
          parentTitle: parentTitle || undefined,
        },
      }));
    }
  }, [searchParams]);

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
            audioFile={uploadData.file} // Pass audio file for media type detection
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
      // Step 1: Create track in database using hook
      const trackResult = await createTrackMutation.mutateAsync({
        title: uploadData.metadata?.title || "",
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

      // Invalidate discovery feed queries to show new track
      queryClient.invalidateQueries({ queryKey: ["tracks"] });
      queryClient.invalidateQueries({ queryKey: ["user", address, "tracks"] });

      // Step 2: Register with Story Protocol
      if (uploadData.yakoa?.verified) {
        console.log("🚀 Starting Story Protocol registration...");

        // Convert license form data to Story Protocol terms
        const { convertLicenseFormToStoryTerms, getLicenseSummary } = await import(
          "@/lib/utils/story-protocol"
        );
        const storyLicenseTerms = uploadData.license
          ? convertLicenseFormToStoryTerms(uploadData.license)
          : null;

        console.log(
          "🎵 License Terms:",
          storyLicenseTerms ? getLicenseSummary(uploadData.license!) : "No license terms",
        );

        // Choose registration method based on whether this is a remix
        const registrationResult =
          uploadData.remix?.isRemix && uploadData.remix.parentIpId
            ? await registerDerivativeMutation.mutateAsync({
                parentIpId: uploadData.remix.parentIpId,
                licenseTermsId: "1", // Default license terms ID - should be dynamic
                ipMetadata: {
                  title: uploadData.metadata?.title || "",
                  description: uploadData.metadata?.description || "",
                  creators: uploadData.metadata?.creators || [
                    {
                      name: "Creator",
                      address: address,
                      contributionPercent: 100,
                    },
                  ],
                  image: uploadData.metadata?.imageUrl || uploadData.uploadInfo?.ipfsUrl || "",
                  mediaUrl: uploadData.uploadInfo?.ipfsUrl,
                  mediaType: uploadData.metadata?.mediaType || "audio/mpeg",
                },
                nftMetadata: {
                  name: uploadData.metadata?.title || "Untitled Remix",
                  description: `${uploadData.metadata?.description || "No description"}. This is a remix of "${uploadData.remix.parentTitle}". This NFT represents ownership of the derivative IP Asset.`,
                  image: uploadData.uploadInfo?.ipfsUrl || "",
                  attributes: [
                    {
                      key: "Type",
                      value: "Remix",
                    },
                    {
                      key: "Parent Track",
                      value: uploadData.remix.parentTitle || "Unknown",
                    },
                    {
                      key: "Parent IP ID",
                      value: uploadData.remix.parentIpId,
                    },
                    {
                      key: "Yakoa Verified",
                      value: uploadData.yakoa?.verified ? "Yes" : "No",
                    },
                    {
                      key: "Genre",
                      value: uploadData.metadata?.genre || "Unknown",
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
              })
            : await registerTrackMutation.mutateAsync({
                // === IP METADATA (Story Protocol IPA Standard) ===
                title: uploadData.metadata?.title || "",
                description: uploadData.metadata?.description || "",
                creators: uploadData.metadata?.creators || [
                  {
                    name: "Creator",
                    address: address,
                    contributionPercent: 100,
                  },
                ],
                // Cover art (Story Protocol image.* fields)
                imageUrl: uploadData.metadata?.imageUrl || uploadData.uploadInfo?.ipfsUrl || "",
                imageHash: uploadData.metadata?.imageHash || uploadData.uploadInfo?.fileHash || "",
                // Audio file (Story Protocol media.* fields)
                mediaUrl: uploadData.uploadInfo?.ipfsUrl || "",
                mediaHash: uploadData.uploadInfo?.fileHash || "",
                mediaType: uploadData.metadata?.mediaType || "audio/mpeg",

                // === NFT METADATA (ERC-721 Standard) ===
                nftName: uploadData.metadata?.nftName,
                nftDescription: uploadData.metadata?.nftDescription,
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
                    key: "License Price",
                    value: uploadData.license?.price
                      ? `${uploadData.license.price} USD`
                      : "Unknown",
                  },
                  {
                    key: "Revenue Share",
                    value: storyLicenseTerms
                      ? `${storyLicenseTerms.commercialRevShare}%`
                      : "Unknown",
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

                // === LICENSE TERMS ===
                commercialRemixTerms: storyLicenseTerms
                  ? {
                      defaultMintingFee: Number(storyLicenseTerms.defaultMintingFee) / 10 ** 18, // Convert back to number for API
                      commercialRevShare: storyLicenseTerms.commercialRevShare,
                    }
                  : undefined,
              });

        console.log("📋 Story Protocol result:", registrationResult);

        if (registrationResult.success) {
          // Store registration result for success modal
          setRegistrationResult({
            title: uploadData.metadata?.title || "Untitled",
            type: uploadData.remix?.isRemix ? "remix" : "track",
            transactionHash: registrationResult.data.transactionHash,
            ipId: registrationResult.data.ipId,
            tokenId: registrationResult.data.tokenId,
            licenseTermsIds: registrationResult.data.licenseTermsIds || [],
            explorerUrl: registrationResult.data.explorerUrl,
            creators: uploadData.metadata?.creators,
            yakoaVerified: uploadData.yakoa?.verified,
            yakoaTokenId: uploadData.yakoa?.tokenId,
          });

          // Show success modal instead of just toast
          setShowSuccessModal(true);
          console.log("✅ Story Protocol registration:", registrationResult.data);
        } else {
          console.error("❌ Story Protocol error:", registrationResult.error);
          const errorMessage = uploadData.remix?.isRemix
            ? `Remix registration failed: ${registrationResult.error}`
            : `Story Protocol registration failed: ${registrationResult.error}`;
          toast.error(errorMessage);
        }
      } else {
        console.log("⚠️ Skipping Story Protocol registration - content not verified");
        toast.info(
          "Track uploaded successfully (Story Protocol registration skipped for unverified content)",
        );

        // For unverified content, show a simple success message and redirect
        const finalSuccessMessage = uploadData.remix?.isRemix
          ? "Remix uploaded successfully!"
          : "Track uploaded successfully!";
        toast.success(finalSuccessMessage);
        router.push(`/profile/${address}`);
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error("Failed to register track. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4">
      {/* Header - Left aligned like library page */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="font-bold text-3xl">
            {uploadData.remix?.isRemix ? "Create Remix" : "Upload Your Sound"}
          </h1>
          {uploadData.remix?.isRemix && (
            <div className="rounded-full bg-purple-100 px-3 py-1 font-medium text-purple-800 text-sm dark:bg-purple-900 dark:text-purple-200">
              Remix
            </div>
          )}
        </div>
        <p className="text-muted-foreground">
          {uploadData.remix?.isRemix
            ? `Creating a remix of "${uploadData.remix.parentTitle || "Unknown Track"}"`
            : "Protect your IP with AI verification and blockchain registration"}
        </p>
      </div>

      {/* Progress and Content - Full width within container */}
      <div className="space-y-6">
        {/* Progress Indicator */}
        <div className="space-y-4">
          <Progress value={(currentStep / steps.length) * 100} className="h-2 [&>div]:bg-primary" />
          <div className="flex justify-between text-sm">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex flex-col items-center space-y-1 ${
                  currentStep >= step.id ? "text-primary" : "text-muted-foreground"
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

      {/* Success Modal */}
      {showSuccessModal && registrationResult && (
        <RegistrationSuccessModal
          open={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          data={registrationResult}
          onViewProfile={() => {
            setShowSuccessModal(false);
            router.push(`/profile/${address}`);
          }}
          onDiscoverMore={() => {
            setShowSuccessModal(false);
            router.push("/discover");
          }}
          onViewTrack={() => {
            setShowSuccessModal(false);
            // Navigate to track page if we have the track ID
            // For now, go to profile where they can see their tracks
            router.push(`/profile/${address}`);
          }}
        />
      )}
    </div>
  );
}
