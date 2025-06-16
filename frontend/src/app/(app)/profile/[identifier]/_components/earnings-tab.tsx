"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useClaimRoyalty, useTracks, useUserEarnings } from "@/hooks/api";
import {
  DollarSign,
  Download,
  ExternalLink,
  Loader2,
  Music,
  TrendingUp,
  Users,
} from "lucide-react";

import { toast } from "sonner";
import { useAccount } from "wagmi";

export function EarningsTab() {
  const { address } = useAccount();
  const claimRoyalty = useClaimRoyalty();

  // Get creator's earnings summary from API
  const { data: earningsResponse, isLoading: earningsLoading } = useUserEarnings(address || "");
  const earningsSummary = earningsResponse?.data || {
    totalRevenue: 0,
    totalLicensesSold: 0,
    totalClaimed: 0,
    pendingRevenue: 0,
    trackCount: 0,
  };

  // Get creator's tracks for detailed view
  const { data: tracksResponse } = useTracks({ user_address: address });
  const creatorTracks = tracksResponse?.data?.tracks || [];

  const handleClaimRevenue = async () => {
    if (!address) return;

    try {
      // Get the first track's IP ID for claiming (in a real app, you'd claim for each track)
      const trackWithRevenue = creatorTracks.find(
        (track) => track.ipId && earningsSummary.pendingRevenue > 0,
      );

      if (!trackWithRevenue?.ipId) {
        toast.error("No IP assets found with claimable revenue");
        return;
      }

      const result = await claimRoyalty.mutateAsync({
        ancestorIpId: trackWithRevenue.ipId,
        claimer: address,
      });

      if (result.success) {
        toast.success(
          `Successfully claimed revenue! Transaction: ${result.data?.transactionHash?.slice(0, 10)}...`,
        );
        // Refresh the data
        window.location.reload();
      } else {
        toast.error(`Failed to claim revenue: ${result.error}`);
      }
    } catch (error) {
      console.error("Revenue claim error:", error);
      toast.error("Failed to claim revenue. Please try again.");
    }
  };

  if (earningsLoading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse space-y-2 pb-3">
                <div className="h-4 w-20 rounded bg-muted" />
                <div className="h-8 w-16 rounded bg-muted" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Earnings Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{earningsSummary.totalRevenue} WIP</div>
            <p className="text-muted-foreground text-xs">Lifetime earnings from licenses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Licenses Sold</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{earningsSummary.totalLicensesSold}</div>
            <p className="text-muted-foreground text-xs">Total license purchases</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Available to Claim</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl text-green-600">
              {earningsSummary.pendingRevenue} WIP
            </div>
            <p className="text-muted-foreground text-xs">Ready to withdraw</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Tracks</CardTitle>
            <Music className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{earningsSummary.trackCount}</div>
            <p className="text-muted-foreground text-xs">Registered for licensing</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Actions */}
      {earningsSummary.pendingRevenue > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Claim Your Revenue
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-green-50 p-4 dark:bg-green-950">
              <div>
                <p className="font-medium">You have unclaimed revenue!</p>
                <p className="text-muted-foreground text-sm">
                  {earningsSummary.pendingRevenue} WIP tokens are ready to be claimed
                </p>
              </div>
              <Button
                onClick={handleClaimRevenue}
                disabled={claimRoyalty.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {claimRoyalty.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Claiming...
                  </>
                ) : (
                  `Claim ${earningsSummary.pendingRevenue} WIP`
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Earning Tracks */}
      <Card>
        <CardHeader>
          <CardTitle>Top Earning Tracks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {creatorTracks.slice(0, 5).map((track) => (
              <div
                key={track.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Music className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{track.title}</p>
                    <p className="text-muted-foreground text-sm">
                      {track.genre} • {track.duration || "0:00"}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <Badge variant="secondary" className="text-xs">
                    Registered
                  </Badge>
                </div>
              </div>
            ))}

            {creatorTracks.length === 0 && (
              <div className="flex flex-col items-center justify-center p-6 text-center">
                <TrendingUp className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">No tracks registered yet</p>
                <p className="text-muted-foreground text-sm">
                  Upload and register your music to start earning
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Revenue Claims History */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Total Earned</p>
                  <p className="text-muted-foreground text-sm">Lifetime revenue</p>
                </div>
              </div>
              <p className="font-bold text-lg">{earningsSummary.totalRevenue} WIP</p>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                  <Download className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Already Claimed</p>
                  <p className="text-muted-foreground text-sm">Withdrawn to wallet</p>
                </div>
              </div>
              <p className="font-bold text-lg">{earningsSummary.totalClaimed} WIP</p>
            </div>

            {earningsSummary.totalRevenue === 0 && (
              <div className="flex flex-col items-center justify-center p-6 text-center">
                <DollarSign className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">No revenue generated yet</p>
                <p className="text-muted-foreground text-sm">
                  License sales will generate revenue that appears here
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
