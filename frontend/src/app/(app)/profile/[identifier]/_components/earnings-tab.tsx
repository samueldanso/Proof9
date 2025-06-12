"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { monetizationQueries, trackQueries } from "@/lib/db";
import { useQuery } from "@tanstack/react-query";
import { DollarSign, Download, ExternalLink, Music, TrendingUp, Users } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";

export function EarningsTab() {
  const { address } = useAccount();

  // Get creator's tracks
  const { data: creatorTracks = [] } = useQuery({
    queryKey: ["creator-tracks", address],
    queryFn: async () => {
      if (!address) return [];
      return trackQueries.getByArtist(address);
    },
    enabled: !!address,
  });

  // Get creator's revenue claims
  const { data: revenueClaims = [], isLoading: revenueLoading } = useQuery({
    queryKey: ["creator-revenue", address],
    queryFn: async () => {
      if (!address) return [];
      return monetizationQueries.revenue.getForCreator(address);
    },
    enabled: !!address,
  });

  // Calculate earnings summary
  const earningsSummary = useMemo(() => {
    const totalRevenue = creatorTracks.reduce(
      (sum, track) => sum + (track.total_revenue_earned || 0),
      0,
    );
    const totalLicensesSold = creatorTracks.reduce(
      (sum, track) => sum + (track.total_licenses_sold || 0),
      0,
    );
    const totalClaimed = revenueClaims.reduce((sum, claim) => sum + claim.amount_claimed, 0);
    const pendingRevenue = totalRevenue - totalClaimed;

    return {
      totalRevenue,
      totalLicensesSold,
      totalClaimed,
      pendingRevenue,
      trackCount: creatorTracks.length,
    };
  }, [creatorTracks, revenueClaims]);

  const handleClaimRevenue = async () => {
    try {
      if (!address) return;

      // Call the backend API to claim revenue
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/royalty/claim`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ancestorIpId: address, // Use creator's address as IP ID
          claimer: address,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Successfully claimed ${earningsSummary.pendingRevenue} WIP tokens!`);
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

  if (revenueLoading) {
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
              <Button onClick={handleClaimRevenue} className="bg-green-600 hover:bg-green-700">
                Claim {earningsSummary.pendingRevenue} WIP
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
            {creatorTracks
              .filter((track) => track.total_revenue_earned > 0)
              .sort((a, b) => (b.total_revenue_earned || 0) - (a.total_revenue_earned || 0))
              .slice(0, 5)
              .map((track) => (
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
                        {track.total_licenses_sold || 0} licenses sold
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-medium">{track.total_revenue_earned || 0} WIP</p>
                    <Badge variant="secondary" className="text-xs">
                      {(
                        ((track.total_revenue_earned || 0) /
                          Math.max(earningsSummary.totalRevenue, 1)) *
                        100
                      ).toFixed(1)}
                      %
                    </Badge>
                  </div>
                </div>
              ))}

            {creatorTracks.filter((track) => track.total_revenue_earned > 0).length === 0 && (
              <div className="flex flex-col items-center justify-center p-6 text-center">
                <TrendingUp className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">No revenue generated yet</p>
                <p className="text-muted-foreground text-sm">
                  When people license your music, earnings will appear here
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Revenue Claims History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Revenue Claims</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {revenueClaims.slice(0, 5).map((claim) => (
              <div
                key={claim.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                    <Download className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">{claim.amount_claimed} WIP</p>
                    <p className="text-muted-foreground text-sm">
                      {new Date(claim.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <Button variant="ghost" size="sm">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {revenueClaims.length === 0 && (
              <div className="flex flex-col items-center justify-center p-6 text-center">
                <DollarSign className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">No revenue claimed yet</p>
                <p className="text-muted-foreground text-sm">
                  Your revenue claims will appear here
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
