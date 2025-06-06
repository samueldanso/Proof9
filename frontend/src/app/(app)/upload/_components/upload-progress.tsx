"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Brain, CheckCircle, FileAudio } from "lucide-react";
import { useEffect, useState } from "react";

interface YakoaResult {
  verified: boolean;
  confidence: number;
  originality: string;
}

interface UploadProgressProps {
  file?: File;
  onVerificationComplete: (yakoaResult: YakoaResult) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function UploadProgress({
  file,
  onVerificationComplete,
  onNext,
  onBack,
}: UploadProgressProps) {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<"uploading" | "analyzing" | "complete">("uploading");
  const [yakoaResult, setYakoaResult] = useState<YakoaResult | null>(null);

  useEffect(() => {
    if (!file) return;

    // Simulate verification process
    const simulateVerification = async () => {
      // Stage 1: Upload simulation
      setStage("uploading");
      for (let i = 0; i <= 40; i += 2) {
        setProgress(i);
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      // Stage 2: AI Analysis simulation
      setStage("analyzing");
      for (let i = 40; i <= 100; i += 3) {
        setProgress(i);
        await new Promise((resolve) => setTimeout(resolve, 80));
      }

      // Stage 3: Complete with mock result
      setStage("complete");

      // Mock Yakoa result - in real app this would be API response
      const mockResult: YakoaResult = {
        verified: Math.random() > 0.3, // 70% chance of being verified
        confidence: Math.floor(Math.random() * 30) + 70, // 70-100% confidence
        originality: Math.random() > 0.5 ? "Original" : "Derivative Work Detected",
      };

      setYakoaResult(mockResult);
    };

    simulateVerification();
  }, [file]);

  const handleContinue = () => {
    if (yakoaResult) {
      onVerificationComplete(yakoaResult);
      // onNext is called automatically by parent
    }
  };

  const getStageText = () => {
    switch (stage) {
      case "uploading":
        return "Uploading audio file...";
      case "analyzing":
        return "AI analyzing originality...";
      case "complete":
        return "Verification complete!";
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
      <div className="space-y-2 text-center">
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
                stage === "complete" ? "text-green-600" : "text-muted-foreground"
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
                {yakoaResult.verified ? "Verification Successful" : "Review Required"}
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-muted-foreground text-sm">Status</span>
                <div>
                  <Badge variant={yakoaResult.verified ? "default" : "secondary"}>
                    {yakoaResult.verified ? "Verified Original" : "Needs Review"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-muted-foreground text-sm">Confidence</span>
                <div className={`font-semibold ${getConfidenceColor(yakoaResult.confidence)}`}>
                  {yakoaResult.confidence}%
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-muted-foreground text-sm">Analysis Result</span>
              <p className="font-medium">{yakoaResult.originality}</p>
            </div>

            {!yakoaResult.verified && (
              <div className="rounded-lg bg-orange-50 p-4 dark:bg-orange-950/20">
                <p className="text-orange-800 text-sm dark:text-orange-200">
                  Your track may contain elements similar to existing works. You can still proceed,
                  but consider reviewing your licensing terms.
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
          onClick={handleContinue}
          disabled={stage !== "complete"}
          className="flex-1 bg-primary hover:bg-primary/90"
        >
          {stage === "complete" ? "Continue →" : "Processing..."}
        </Button>
      </div>
    </div>
  );
}
