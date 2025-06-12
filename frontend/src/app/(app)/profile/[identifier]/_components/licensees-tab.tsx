"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getAvatarUrl, getUserInitials } from "@/lib/avatar";
import { monetizationQueries } from "@/lib/db";
import { useQuery } from "@tanstack/react-query";
import { Calendar, DollarSign, Music } from "lucide-react";
import { useAccount } from "wagmi";

export function LicenseesTab() {
  const { address } = useAccount();

  // Get all license transactions for tracks owned by this user
  const { data: licenses = [], isLoading } = useQuery({
    queryKey: ["creator-licensees", address],
    queryFn: async () => {
      if (!address) return [];

      // First get all tracks by this creator
      const { trackQueries } = await import("@/lib/db/queries");
      const creatorTracks = await trackQueries.getByArtist(address);

      // Then get all license transactions for these tracks
      const allLicenses = await Promise.all(
        creatorTracks.map((track) => monetizationQueries.licenses.getForTrack(track.id)),
      );

      // Flatten and add track info
      return allLicenses.flat().map((license) => ({
        ...license,
        track: creatorTracks.find((t) => t.id === license.track_id),
      }));
    },
    enabled: !!address,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4">
            <div className="animate-pulse space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted" />
                <div className="space-y-2">
                  <div className="h-4 w-32 rounded bg-muted" />
                  <div className="h-3 w-24 rounded bg-muted" />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (licenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Music className="mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="mb-2 font-bold text-xl">No licensees yet</h3>
        <p className="text-muted-foreground">When people license your music, they'll appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className="font-semibold text-lg">Your Licensees</h3>
        <p className="text-muted-foreground text-sm">
          People and businesses who have licensed your music
        </p>
      </div>

      {licenses.map((license) => (
        <Card key={license.id} className="p-4">
          <div className="space-y-4">
            {/* Licensee Info */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={getAvatarUrl()} />
                  <AvatarFallback>{getUserInitials(license.buyer_address)}</AvatarFallback>
                </Avatar>

                <div>
                  <p className="font-medium">
                    {license.buyer_address.slice(0, 6)}...
                    {license.buyer_address.slice(-4)}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Licensed: {license.track?.title || "Unknown Track"}
                  </p>
                </div>
              </div>

              <Badge
                variant={license.status === "active" ? "default" : "secondary"}
                className="capitalize"
              >
                {license.status}
              </Badge>
            </div>

            <Separator />

            {/* License Details */}
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{license.price_paid} WIP</p>
                  <p className="text-muted-foreground text-xs">Price Paid</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{new Date(license.created_at).toLocaleDateString()}</p>
                  <p className="text-muted-foreground text-xs">License Date</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Music className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium capitalize">{license.license_type}</p>
                  <p className="text-muted-foreground text-xs">License Type</p>
                </div>
              </div>
            </div>

            {/* Revenue Share Info */}
            {license.revenue_share_percent && (
              <div className="rounded-lg bg-green-50 p-3 dark:bg-green-950">
                <p className="text-green-800 text-sm dark:text-green-200">
                  💰 You earn {license.revenue_share_percent}% revenue share from this license
                </p>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
