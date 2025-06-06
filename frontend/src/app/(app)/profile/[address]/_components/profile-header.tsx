"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { useAccount } from "wagmi";

interface ProfileHeaderProps {
  trackCount?: number;
  followingCount?: number;
  followersCount?: number;
}

export function ProfileHeader({
  trackCount = 0,
  followingCount = 0,
  followersCount = 0,
}: ProfileHeaderProps) {
  const params = useParams();
  const { address: connectedAddress } = useAccount();
  const profileAddress = params.address as string;

  // Check if this is the current user's profile
  const isOwnProfile = connectedAddress?.toLowerCase() === profileAddress?.toLowerCase();

  // Create display name from address
  const displayName = profileAddress
    ? `${profileAddress.substring(0, 6)}...${profileAddress.substring(profileAddress.length - 4)}`
    : "Unknown";

  return (
    <div className="w-full">
      {/* Banner */}
      <div className="relative h-48 w-full bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Profile Content */}
      <div className="relative px-6 pb-6">
        {/* Profile Avatar - Positioned to overlap banner */}
        <div className="-mt-16 mb-4 flex items-end justify-between">
          <Avatar className="h-32 w-32 border-4 border-background">
            <AvatarImage src="" alt={displayName} />
            <AvatarFallback className="bg-primary font-bold text-2xl text-primary-foreground">
              {profileAddress?.substring(2, 4).toUpperCase() || "??"}
            </AvatarFallback>
          </Avatar>

          {/* Edit Profile Button (only for own profile) */}
          {isOwnProfile && (
            <Button variant="outline" className="mb-2">
              Edit Profile
            </Button>
          )}
        </div>

        {/* Profile Info */}
        <div className="space-y-4">
          {/* Name */}
          <div>
            <h1 className="font-bold text-2xl">{displayName}</h1>
            <p className="font-mono text-muted-foreground text-sm">{profileAddress}</p>
          </div>

          {/* Stats */}
          <div className="flex gap-6">
            <div className="text-center">
              <div className="font-bold text-lg">{trackCount}</div>
              <div className="text-muted-foreground text-sm">Tracks</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg">{followingCount}</div>
              <div className="text-muted-foreground text-sm">Following</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg">{followersCount}</div>
              <div className="text-muted-foreground text-sm">Followers</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
