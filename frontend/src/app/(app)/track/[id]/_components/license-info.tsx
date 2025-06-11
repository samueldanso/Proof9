"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  convertLicenseFormToStoryTerms,
  convertUSDToWIP,
  getLicenseSummary,
} from "@/lib/story-protocol";
import { CheckCircle, Download, ExternalLink, Loader2, Shield } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";

interface Track {
  id: string;
  title: string;
  artist: string;
  artistAddress: string;
  duration: string;
  plays: number;
  verified: boolean;
  likes: number;
  comments: number;
  isLiked: boolean;
  imageUrl?: string;
  description?: string;
  genre?: string;
  bpm?: number;
  key?: string;
  createdAt?: string;
  license?: {
    type: string;
    price: string;
    available: boolean;
    terms: string;
    downloads: number;
  };
}

interface LicenseInfoProps {
  track: Track;
  ipAssetId?: string; // Story Protocol IP Asset ID
}

export default function LicenseInfo({ track, ipAssetId }: LicenseInfoProps) {
  const { address, isConnected } = useAccount();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  if (!track.license) return null;

  // Convert license data for Story Protocol
  const licenseFormData = {
    type: track.license.type.toLowerCase(),
    price: track.license.price.replace("$", ""),
    usage: "multiple",
    territory: "worldwide",
  };

  const storyTerms = convertLicenseFormToStoryTerms(licenseFormData);
  const wipAmount = Number(storyTerms.defaultMintingFee) / 10 ** 18;

  const handlePurchaseLicense = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet to purchase a license");
      return;
    }

    if (!ipAssetId) {
      toast.error("IP Asset ID not found. Track may not be registered yet.");
      return;
    }

    if (address?.toLowerCase() === track.artistAddress?.toLowerCase()) {
      toast.error("You cannot purchase a license for your own track");
      return;
    }

    setIsPurchasing(true);

    try {
      // Call Story Protocol license minting endpoint
      const response = await fetch("/api/licenses/mint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          licensorIpId: ipAssetId,
          amount: 1,
          receiver: address,
          maxMintingFee: storyTerms.defaultMintingFee.toString(),
          maxRevenueShare: storyTerms.commercialRevShare,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setPurchaseSuccess(true);
        toast.success(
          `License purchased successfully! Transaction: ${result.data.transactionHash.slice(
            0,
            10,
          )}...`,
        );

        // Could update local state or refetch data here
      } else {
        throw new Error(result.error || "Failed to purchase license");
      }
    } catch (error) {
      console.error("License purchase error:", error);
      toast.error(
        `Failed to purchase license: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h2 className="font-semibold text-xl">License & Rights</h2>
          <p className="text-muted-foreground text-sm">Secure your rights to use this track</p>
        </div>

        <Separator />

        {/* License Type */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-medium">License Type</span>
            <Badge variant="secondary">{track.license.type}</Badge>
          </div>

          {track.verified && (
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <CheckCircle className="h-4 w-4" />
              <span>Verified Original Content</span>
            </div>
          )}
        </div>

        <Separator />

        {/* Story Protocol Pricing */}
        <div className="space-y-4">
          <div className="text-center">
            <div className="font-bold text-3xl">{wipAmount} WIP</div>
            <div className="text-muted-foreground text-sm">~${track.license.price} USD</div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center text-sm">
            <div>
              <div className="font-medium">{track.license.downloads}</div>
              <div className="text-muted-foreground">Sales</div>
            </div>
            <div>
              <div className="font-medium">{storyTerms.commercialRevShare}%</div>
              <div className="text-muted-foreground">Revenue Share</div>
            </div>
          </div>

          {/* Story Protocol Terms Preview */}
          <div className="rounded-lg border bg-blue-50 p-3 dark:bg-blue-950">
            <div className="mb-2 flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-900 text-sm dark:text-blue-100">
                Story Protocol Terms
              </span>
            </div>
            <div className="space-y-1 text-blue-800 text-sm dark:text-blue-200">
              <p>{getLicenseSummary(licenseFormData)}</p>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                <div>Commercial Use: {storyTerms.commercialUse ? "✅" : "❌"}</div>
                <div>Derivatives: {storyTerms.derivativesAllowed ? "✅" : "❌"}</div>
                <div>Transferable: {storyTerms.transferable ? "✅" : "❌"}</div>
                <div>Attribution Required: ✅</div>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* What's Included */}
        <div className="space-y-3">
          <h3 className="font-medium">What's included:</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>High-quality audio file</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Commercial usage rights</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Blockchain verification</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Story Protocol license NFT</span>
            </li>
          </ul>
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="space-y-3">
          {purchaseSuccess ? (
            <div className="space-y-3 text-center">
              <div className="flex items-center justify-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">License Purchased!</span>
              </div>
              <Button variant="outline" className="w-full">
                <ExternalLink className="mr-2 h-4 w-4" />
                View License NFT
              </Button>
            </div>
          ) : (
            <>
              <Button
                className="w-full"
                size="lg"
                onClick={handlePurchaseLicense}
                disabled={isPurchasing || !track.verified || !isConnected}
              >
                {isPurchasing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Purchasing...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    {!isConnected
                      ? "Connect Wallet"
                      : !track.verified
                        ? "Verification Required"
                        : `Buy License - ${wipAmount} WIP`}
                  </>
                )}
              </Button>

              <Button variant="outline" className="w-full">
                Preview Audio
              </Button>
            </>
          )}
        </div>

        {/* Terms */}
        <div className="text-center text-muted-foreground text-xs">
          <p>By purchasing, you agree to the licensing terms.</p>
          <p className="mt-1">Protected by Story Protocol</p>
          {ipAssetId && (
            <p className="mt-1 font-mono text-xs">
              IP: {ipAssetId.slice(0, 10)}...{ipAssetId.slice(-6)}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
