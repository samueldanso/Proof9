"use client";

import { AddressDisplay } from "@/components/shared/address-display";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
      <DialogContent className="max-w-2xl">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <DialogTitle className="font-bold text-2xl text-green-600 dark:text-green-400">
            Registration Successful!
          </DialogTitle>
          <p className="text-muted-foreground">
            Your {data.type} "{data.title}" has been successfully registered on Story Protocol
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Badges */}
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="outline" className="border-green-500 text-green-600">
              <CheckCircle className="mr-1 h-3 w-3" />
              Story Protocol Registered
            </Badge>
            {data.yakoaVerified && (
              <Badge variant="outline" className="border-blue-500 text-blue-600">
                <CheckCircle className="mr-1 h-3 w-3" />
                Yakoa Verified
              </Badge>
            )}
            <Badge variant="outline" className="border-purple-500 text-purple-600">
              <Music className="mr-1 h-3 w-3" />
              {data.type === "remix" ? "Derivative IP" : "Original IP"}
            </Badge>
          </div>

          {/* Registration Details */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* IP Details */}
            <Card>
              <CardContent className="p-4">
                <h3 className="mb-3 font-semibold text-sm">IP Asset Details</h3>
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
            <Card>
              <CardContent className="p-4">
                <h3 className="mb-3 font-semibold text-sm">Transaction Details</h3>
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
            <Card>
              <CardContent className="p-4">
                <h3 className="mb-3 font-semibold text-sm">
                  <User className="mr-1 inline h-4 w-4" />
                  Creator{data.creators.length > 1 ? "s" : ""} ({data.creators.length})
                </h3>
                <div className="space-y-2">
                  {data.creators.map((creator) => (
                    <div
                      key={creator.address}
                      className="flex items-center justify-between rounded bg-muted/50 p-2"
                    >
                      <div>
                        <p className="font-medium text-sm">{creator.name}</p>
                        <p className="text-muted-foreground text-xs">
                          {creator.address.slice(0, 6)}...{creator.address.slice(-4)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">{creator.contributionPercent}%</p>
                        <p className="text-muted-foreground text-xs">Contribution</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Explorer Link */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-sm">View on Story Explorer</h3>
                  <p className="text-muted-foreground text-xs">
                    Explore your IP asset on the Story Protocol explorer
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(data.explorerUrl, "_blank")}
                  className="shrink-0"
                >
                  <ExternalLink className="mr-1 h-3 w-3" />
                  View Explorer
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row">
            {onViewTrack && (
              <Button onClick={onViewTrack} className="flex-1">
                <Eye className="mr-2 h-4 w-4" />
                View {data.type === "remix" ? "Remix" : "Track"}
              </Button>
            )}
            <Button onClick={onViewProfile} variant="outline" className="flex-1">
              <User className="mr-2 h-4 w-4" />
              View Profile
            </Button>
            <Button onClick={onDiscoverMore} variant="outline" className="flex-1">
              <Music className="mr-2 h-4 w-4" />
              Discover More
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
