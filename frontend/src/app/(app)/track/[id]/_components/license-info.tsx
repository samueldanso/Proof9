"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Download, Shield } from "lucide-react";

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
}

export default function LicenseInfo({ track }: LicenseInfoProps) {
  if (!track.license) return null;

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

        {/* Pricing */}
        <div className="space-y-4">
          <div className="text-center">
            <div className="font-bold text-3xl">{track.license.price}</div>
            <div className="text-muted-foreground text-sm">~${(0.05 * 3000).toFixed(0)} USD</div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center text-sm">
            <div>
              <div className="font-medium">{track.license.downloads}</div>
              <div className="text-muted-foreground">Sales</div>
            </div>
            <div>
              <div className="font-medium">Story</div>
              <div className="text-muted-foreground">Blockchain</div>
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
              <span>License certificate</span>
            </li>
          </ul>
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button className="w-full" size="lg">
            <Download className="mr-2 h-4 w-4" />
            Buy License Now
          </Button>

          <Button variant="outline" className="w-full">
            Preview Audio
          </Button>
        </div>

        {/* Terms */}
        <div className="text-center text-muted-foreground text-xs">
          <p>By purchasing, you agree to the licensing terms.</p>
          <p className="mt-1">Protected by Story Protocol</p>
        </div>
      </div>
    </Card>
  );
}
