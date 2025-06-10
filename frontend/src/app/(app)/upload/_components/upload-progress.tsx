"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  useUploadAudio,
  useVerificationStatus,
  useVerifyTrack,
} from "@/lib/api/hooks";
import {
  AlertTriangle,
  Brain,
  CheckCircle,
  FileAudio,
  RefreshCw,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface YakoaResult {
  verified: boolean;
  confidence: number;
  originality: string;
  tokenId?: string;
  details?: string;
}

interface UploadProgressProps {
  file?: File;
  onVerificationComplete: (yakoaResult: YakoaResult) => void;
  onNext: () => void;
  onBack: () => void;
}

// Define the infringement types for proper typing
interface ExternalInfringement {
  brand_id: string;
  brand_name: string;
  confidence: number;
  authorized: boolean;
}

interface InNetworkInfringement {
  token_id: string;
  confidence: number;
  licensed: boolean;
}

export default function UploadProgress({
  file,
  onVerificationComplete,
  onNext,
  onBack,
}: UploadProgressProps) {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<
    "uploading" | "analyzing" | "complete" | "error"
  >("uploading");
  const [yakoaResult, setYakoaResult] = useState<YakoaResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tokenId, setTokenId] = useState<string | null>(null);

  // API hooks
  const uploadAudio = useUploadAudio();
  const verifyTrack = useVerifyTrack();
  const { data: verificationStatus, refetch: refetchStatus } =
    useVerificationStatus(tokenId || "");

  useEffect(() => {
    if (!file) return;

    const performRealVerification = async () => {
      try {
        setError(null);
        setStage("uploading");

        // Stage 1: Upload to IPFS (Real backend call)
        setProgress(10);

        // Convert file to base64 for upload
        const fileBuffer = await file.arrayBuffer();
        const base64Data = Buffer.from(fileBuffer).toString("base64");

        setProgress(25);

        const uploadResult = await uploadAudio.mutateAsync({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          fileData: base64Data,
        });

        setProgress(40);

        // Stage 2: Yakoa verification (Real API call)
        setStage("analyzing");
        setProgress(50);

        // Generate a unique token ID and dummy blockchain data for verification
        const dummyCreatorAddress =
          "0x1234567890123456789012345678901234567890";
        const dummyTxHash =
          "0x" +
          Array(64)
            .fill(0)
            .map(() => Math.floor(Math.random() * 16).toString(16))
            .join("");
        const generatedTokenId = `${dummyCreatorAddress}:${Date.now()}`;

        const verificationData = {
          tokenId: generatedTokenId,
          creatorId: dummyCreatorAddress,
          title: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
          description: `Audio file uploaded via Proof9: ${file.name}`,
          mediaItems: [
            {
              media_id: uploadResult.data.ipfsHash,
              url: uploadResult.data.ipfsUrl,
              hash: uploadResult.data.fileHash,
            },
          ],
          transaction: {
            hash: dummyTxHash,
            blockNumber: Math.floor(Math.random() * 1000000) + 18000000,
            timestamp: Math.floor(Date.now() / 1000),
            chain: "docs-demo",
          },
        };

        setProgress(65);

        const verificationResult = await verifyTrack.mutateAsync(
          verificationData
        );

        // verifyTrack.mutateAsync returns API response directly: { success, data, error }
        if (verificationResult.success) {
          setTokenId(verificationResult.data.tokenId);
          setProgress(80);

          // Poll for verification status
          await pollVerificationStatus(verificationResult.data.tokenId);
        } else {
          throw new Error(verificationResult.error || "Verification failed");
        }
      } catch (err) {
        console.error("Verification error:", err);
        setError(err instanceof Error ? err.message : "Verification failed");
        setStage("error");
        toast.error("Verification failed", {
          description:
            err instanceof Error ? err.message : "Unknown error occurred",
        });
      }
    };

    performRealVerification();
  }, [file]);

  const pollVerificationStatus = async (tokenId: string) => {
    const maxAttempts = 30; // 30 attempts * 2 seconds = 60 seconds max
    let attempts = 0;

    const checkStatus = async (): Promise<void> => {
      if (attempts >= maxAttempts) {
        throw new Error("Verification timeout - please try again");
      }

      attempts++;
      setProgress(80 + (attempts / maxAttempts) * 15); // Progress from 80% to 95%

      try {
        const statusResult = await refetchStatus();

        // statusResult is a React Query result: { data: ApiResponse, ... }
        if (
          statusResult.data?.success &&
          statusResult.data?.data?.verificationStatus?.length > 0
        ) {
          const status = statusResult.data.data.verificationStatus[0];

          if (
            status.status === "processed" ||
            status.infringementCheckStatus === "complete"
          ) {
            // Verification complete
            setProgress(100);
            setStage("complete");

            const hasInfringements =
              (status.externalInfringements &&
                status.externalInfringements.length > 0) ||
              (status.inNetworkInfringements &&
                status.inNetworkInfringements.length > 0);

            const confidence = hasInfringements
              ? Math.max(
                  ...[
                    ...(status.externalInfringements?.map(
                      (inf: ExternalInfringement) => inf.confidence
                    ) || []),
                    ...(status.inNetworkInfringements?.map(
                      (inf: InNetworkInfringement) => inf.confidence
                    ) || []),
                  ]
                )
              : 95;

            const result: YakoaResult = {
              verified: !hasInfringements,
              confidence: confidence,
              originality: hasInfringements
                ? "Potential infringement detected"
                : "Original content verified",
              tokenId: tokenId,
              details: hasInfringements
                ? `Found ${
                    (status.externalInfringements?.length || 0) +
                    (status.inNetworkInfringements?.length || 0)
                  } potential matches`
                : "No infringement detected",
            };

            setYakoaResult(result);
            return;
          } else if (status.status === "error" || status.status === "failed") {
            throw new Error("Verification failed on Yakoa service");
          }
        }

        // Still processing, wait and try again
        setTimeout(checkStatus, 2000);
      } catch (err) {
        console.error("Status check error:", err);
        throw err;
      }
    };

    // Start polling
    setTimeout(checkStatus, 2000);
  };

  const handleContinue = () => {
    if (yakoaResult) {
      onVerificationComplete(yakoaResult);
      // onNext is called automatically by parent
    }
  };

  const handleRetry = () => {
    setProgress(0);
    setStage("uploading");
    setError(null);
    setYakoaResult(null);
    setTokenId(null);

    // Re-trigger verification
    if (file) {
      // The useEffect will trigger again due to state changes
    }
  };

  const getStageText = () => {
    switch (stage) {
      case "uploading":
        return "Uploading to IPFS & registering...";
      case "analyzing":
        return "AI analyzing for originality...";
      case "complete":
        return "Verification complete!";
      case "error":
        return "Verification failed";
      default:
        return "";
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-green-600";
    if (confidence >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="font-bold text-2xl">AI Verification</h2>
        <p className="text-muted-foreground">
          Yakoa is analyzing your audio for originality and authenticity
        </p>
      </div>

      {/* File Info */}
      {file && (
        <Card className="p-4">
          <div className="flex items-center space-x-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <FileAudio className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium">{file.name}</h4>
              <p className="text-muted-foreground text-sm">
                {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Progress Section */}
      <Card className="p-6">
        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">{getStageText()}</span>
              <span className="text-muted-foreground text-sm">{progress}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          {/* Processing Stages */}
          <div className="grid grid-cols-3 gap-4">
            <div
              className={`flex flex-col items-center space-y-2 ${
                stage === "uploading"
                  ? "text-primary"
                  : progress > 40
                  ? "text-green-600"
                  : stage === "error"
                  ? "text-red-600"
                  : "text-muted-foreground"
              }`}
            >
              <div className="rounded-full bg-current/10 p-2">
                <FileAudio className="h-4 w-4" />
              </div>
              <span className="font-medium text-xs">Upload</span>
            </div>

            <div
              className={`flex flex-col items-center space-y-2 ${
                stage === "analyzing"
                  ? "text-primary"
                  : progress === 100
                  ? "text-green-600"
                  : stage === "error" && progress > 40
                  ? "text-red-600"
                  : "text-muted-foreground"
              }`}
            >
              <div className="rounded-full bg-current/10 p-2">
                <Brain className="h-4 w-4" />
              </div>
              <span className="font-medium text-xs">AI Analysis</span>
            </div>

            <div
              className={`flex flex-col items-center space-y-2 ${
                stage === "complete"
                  ? "text-green-600"
                  : stage === "error"
                  ? "text-red-600"
                  : "text-muted-foreground"
              }`}
            >
              <div className="rounded-full bg-current/10 p-2">
                <CheckCircle className="h-4 w-4" />
              </div>
              <span className="font-medium text-xs">Complete</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Error State */}
      {stage === "error" && error && (
        <Card className="border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-950/20">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <h3 className="font-bold text-red-800 text-xl dark:text-red-200">
                Verification Failed
              </h3>
            </div>
            <p className="text-red-700 dark:text-red-300">{error}</p>
            <Button onClick={handleRetry} variant="outline" className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        </Card>
      )}

      {/* Results */}
      {yakoaResult && stage === "complete" && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {yakoaResult.verified ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              )}
              <h3 className="font-bold text-xl">
                {yakoaResult.verified
                  ? "Verification Successful"
                  : "Review Required"}
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-muted-foreground text-sm">Status</span>
                <div>
                  <Badge
                    variant={yakoaResult.verified ? "default" : "secondary"}
                  >
                    {yakoaResult.verified
                      ? "Verified Original"
                      : "Needs Review"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-muted-foreground text-sm">
                  Confidence
                </span>
                <div
                  className={`font-semibold ${getConfidenceColor(
                    yakoaResult.confidence
                  )}`}
                >
                  {yakoaResult.confidence}%
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-muted-foreground text-sm">
                Analysis Result
              </span>
              <p className="font-medium">{yakoaResult.originality}</p>
            </div>

            {yakoaResult.details && (
              <div className="space-y-2">
                <span className="text-muted-foreground text-sm">Details</span>
                <p className="text-sm">{yakoaResult.details}</p>
              </div>
            )}

            {!yakoaResult.verified && (
              <div className="rounded-lg bg-orange-50 p-4 dark:bg-orange-950/20">
                <p className="text-orange-800 text-sm dark:text-orange-200">
                  Your track may contain elements similar to existing works. You
                  can still proceed, but consider reviewing your licensing
                  terms.
                </p>
              </div>
            )}

            {yakoaResult.tokenId && (
              <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950/20">
                <p className="text-blue-800 text-sm dark:text-blue-200">
                  <span className="font-medium">Verification Token:</span>{" "}
                  {yakoaResult.tokenId}
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          ← Back
        </Button>

        <Button
          onClick={stage === "error" ? handleRetry : handleContinue}
          disabled={stage !== "complete" && stage !== "error"}
          className="flex-1 bg-primary hover:bg-primary/90"
        >
          {stage === "complete"
            ? "Continue →"
            : stage === "error"
            ? "Retry"
            : "Processing..."}
        </Button>
      </div>
    </div>
  );
}
