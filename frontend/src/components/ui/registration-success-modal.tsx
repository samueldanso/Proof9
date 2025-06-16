"use client";

import { AddressDisplay } from "@/components/shared/address-display";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { VerificationBadge } from "@/components/ui/verification-badge";
import { cn } from "@/lib/utils";
import { CheckCircle, Copy, ExternalLink, Eye, Music, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface RegistrationSuccessModalProps {
  open: boolean;
  onClose: () => void;
  data: {
    // Basic info
    title: string;
    type: "track" | "remix";

    // Story Protocol data
    transactionHash: string;
    ipId: string;
    tokenId?: string;
    licenseTermsIds?: string[];
    explorerUrl: string;

    // Additional metadata
    creators?: Array<{
      name: string;
      address: string;
      contributionPercent: number;
    }>;

    // Yakoa verification
    yakoaVerified?: boolean;
    yakoaTokenId?: string;
  };
  onViewProfile: () => void;
  onDiscoverMore: () => void;
  onViewTrack?: () => void;
}

export function RegistrationSuccessModal({
  open,
  onClose,
  data,
  onViewProfile,
  onDiscoverMore,
  onViewTrack,
}: RegistrationSuccessModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      toast.success(`${fieldName} copied to clipboard`);

      // Reset copied state after 2 seconds
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      toast.error(`Failed to copy ${fieldName}`);
    }
  };

  const formatHash = (hash: string) => `${hash.slice(0, 8)}...${hash.slice(-6)}`;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader className="pb-6 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 ring-4 ring-green-100 dark:bg-green-900/50 dark:ring-green-900/30">
            <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <DialogTitle className="mb-2 font-bold text-3xl text-green-600 dark:text-green-400">
            🎉 Registration Successful!
          </DialogTitle>
          <p className="text-lg text-muted-foreground">
            Your {data.type} <span className="font-semibold text-foreground">"{data.title}"</span>{" "}
            has been successfully registered on Story Protocol
          </p>
        </DialogHeader>

        <div className="space-y-8">
          {/* Status Badges */}
          <div className="flex flex-wrap justify-center gap-3">
            <Badge
              variant="outline"
              className="border-green-500 bg-green-50 px-4 py-2 font-medium text-green-700 text-sm dark:bg-green-950/30 dark:text-green-400"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Story Protocol Registered
            </Badge>
            {data.yakoaVerified && (
              <VerificationBadge
                verified={data.yakoaVerified}
                showText={true}
                size="md"
                className="px-4 py-2"
              />
            )}
            <Badge
              variant="outline"
              className="border-purple-500 bg-purple-50 px-4 py-2 font-medium text-purple-700 text-sm dark:bg-purple-950/30 dark:text-purple-400"
            >
              <Music className="mr-2 h-4 w-4" />
              {data.type === "remix" ? "Derivative IP" : "Original IP"}
            </Badge>
          </div>

          {/* Registration Details */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* IP Details */}
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-6">
                <h3 className="mb-4 flex items-center gap-2 font-semibold text-base">
                  <Music className="h-5 w-5 text-primary" />
                  IP Asset Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-muted-foreground text-xs">IP Asset ID</span>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 rounded bg-muted px-2 py-1 font-mono text-xs">
                        {formatHash(data.ipId)}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(data.ipId, "IP Asset ID")}
                        className="h-6 w-6 p-0"
                      >
                        <Copy
                          className={cn(
                            "h-3 w-3",
                            copiedField === "IP Asset ID"
                              ? "text-green-500"
                              : "text-muted-foreground",
                          )}
                        />
                      </Button>
                    </div>
                  </div>

                  {data.tokenId && (
                    <div>
                      <span className="text-muted-foreground text-xs">NFT Token ID</span>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 rounded bg-muted px-2 py-1 font-mono text-xs">
                          #{data.tokenId}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(data.tokenId!, "Token ID")}
                          className="h-6 w-6 p-0"
                        >
                          <Copy
                            className={cn(
                              "h-3 w-3",
                              copiedField === "Token ID"
                                ? "text-green-500"
                                : "text-muted-foreground",
                            )}
                          />
                        </Button>
                      </div>
                    </div>
                  )}

                  {data.licenseTermsIds && data.licenseTermsIds.length > 0 && (
                    <div>
                      <span className="text-muted-foreground text-xs">License Terms</span>
                      <div className="flex flex-wrap gap-1">
                        {data.licenseTermsIds.map((id) => (
                          <Badge key={`license-${id}`} variant="secondary" className="text-xs">
                            #{id}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Transaction Details */}
            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 dark:border-blue-800 dark:from-blue-950/30 dark:to-blue-900/30">
              <CardContent className="p-6">
                <h3 className="mb-4 flex items-center gap-2 font-semibold text-base">
                  <ExternalLink className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Transaction Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-muted-foreground text-xs">Transaction Hash</span>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 rounded bg-muted px-2 py-1 font-mono text-xs">
                        {formatHash(data.transactionHash)}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(data.transactionHash, "Transaction Hash")}
                        className="h-6 w-6 p-0"
                      >
                        <Copy
                          className={cn(
                            "h-3 w-3",
                            copiedField === "Transaction Hash"
                              ? "text-green-500"
                              : "text-muted-foreground",
                          )}
                        />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <span className="text-muted-foreground text-xs">Timestamp</span>
                    <p className="text-sm">{new Date().toLocaleString()}</p>
                  </div>

                  {data.yakoaTokenId && (
                    <div>
                      <span className="text-muted-foreground text-xs">Yakoa Token ID</span>
                      <code className="block rounded bg-muted px-2 py-1 font-mono text-xs">
                        {data.yakoaTokenId}
                      </code>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Creators Info */}
          {data.creators && data.creators.length > 0 && (
            <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 dark:border-purple-800 dark:from-purple-950/30 dark:to-purple-900/30">
              <CardContent className="p-6">
                <h3 className="mb-4 flex items-center gap-2 font-semibold text-base">
                  <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  Creator{data.creators.length > 1 ? "s" : ""} ({data.creators.length})
                </h3>
                <div className="space-y-3">
                  {data.creators.map((creator) => (
                    <div
                      key={creator.address}
                      className="flex items-center justify-between rounded-lg border border-purple-200/50 bg-white/60 p-4 dark:border-purple-700/50 dark:bg-black/20"
                    >
                      <div>
                        <p className="font-medium text-sm">{creator.name}</p>
                        <p className="text-muted-foreground text-xs">
                          {creator.address.slice(0, 6)}...{creator.address.slice(-4)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-purple-600 text-sm dark:text-purple-400">
                          {creator.contributionPercent}%
                        </p>
                        <p className="text-muted-foreground text-xs">Contribution</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Explorer Link */}
          <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100 dark:border-green-800 dark:from-green-950/30 dark:to-green-900/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="mb-2 flex items-center gap-2 font-semibold text-base">
                    <ExternalLink className="h-5 w-5 text-green-600 dark:text-green-400" />
                    View on Story Explorer
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Explore your IP asset on the Story Protocol explorer
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => window.open(data.explorerUrl, "_blank")}
                  className="shrink-0 border-green-500 text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950/30"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Explorer
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4 pt-4 sm:flex-row">
            {onViewTrack && (
              <Button
                onClick={onViewTrack}
                className="h-12 flex-1 bg-primary font-medium text-base hover:bg-primary/90"
              >
                <Eye className="mr-2 h-5 w-5" />
                View {data.type === "remix" ? "Remix" : "Track"}
              </Button>
            )}
            <Button
              onClick={onViewProfile}
              variant="outline"
              className="h-12 flex-1 border-2 font-medium text-base"
            >
              <User className="mr-2 h-5 w-5" />
              View Profile
            </Button>
            <Button
              onClick={onDiscoverMore}
              variant="outline"
              className="h-12 flex-1 border-2 font-medium text-base"
            >
              <Music className="mr-2 h-5 w-5" />
              Discover More
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
