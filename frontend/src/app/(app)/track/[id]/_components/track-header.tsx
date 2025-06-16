"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { VerificationBadge } from "@/components/ui/verification-badge";
import { getAvatarUrl, getUserInitials } from "@/lib/utils/avatar";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Track {
  id: string;
  title: string;
  artist: string;
  artistAddress: string;
  artistUsername?: string; // Add this field
  // artistAvatarUrl removed - using creators array instead
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

interface TrackHeaderProps {
  track: Track;
}

export default function TrackHeader({ track }: TrackHeaderProps) {
  const router = useRouter();

  return (
    <div className="space-y-4">
      {/* Back Navigation */}
      <Button
        variant="ghost"
        size="sm"
        className="gap-2 p-0 text-muted-foreground hover:text-foreground"
        onClick={() => router.back()}
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </Button>

      {/* Artist Info */}
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12">
          {/* Avatar removed - using creators array instead */}
          <AvatarFallback className="bg-primary text-primary-foreground">
            {getUserInitials(track.artist)}
          </AvatarFallback>
        </Avatar>
        <div>
          <Link
            href={`/profile/${track.artistUsername || track.artistAddress}`}
            className="font-semibold hover:underline"
          >
            {track.artist}
          </Link>
          <p className="text-muted-foreground text-sm">{track.plays.toLocaleString()} plays</p>
        </div>
      </div>

      {/* Track Title */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="font-bold text-3xl">{track.title}</h1>
          <VerificationBadge verified={track.verified} size="lg" />
        </div>
        {track.verified && (
          <div className="mt-2">
            <VerificationBadge verified={track.verified} showText={true} size="sm" />
          </div>
        )}
      </div>
    </div>
  );
}
