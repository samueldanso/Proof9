"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { useAccount } from "wagmi";
import { useUser } from "@/lib/api/hooks";

export function ProfileHeader() {
  const params = useParams();
  const { address: connectedAddress } = useAccount();
  const profileAddress = params.address as string;

  // Check if this is the current user's profile
  const isOwnProfile =
    connectedAddress?.toLowerCase() === profileAddress?.toLowerCase();

  // Get user data from API
  const { data: userResponse, isLoading } = useUser(profileAddress);
  const userData = userResponse?.data;

  const displayName =
    userData?.displayName ||
    (profileAddress
      ? `${profileAddress.substring(0, 6)}...${profileAddress.substring(
          profileAddress.length - 4
        )}`
      : "Unknown");

  // Get stats from API or default to 0
  const trackCount = userData?.trackCount || 0;
  const followingCount = userData?.followingCount || 0;
  const followersCount = userData?.followersCount || 0;

  const renderActionButtons = () => {
    if (isOwnProfile) {
      // User viewing their own profile - show Edit Profile
      return (
        <Button variant="outline" className="w-full">
          Edit Profile
        </Button>
      );
    }

    // User viewing another profile - show Follow
    return (
      <Button variant="default" className="w-full">
        Follow
      </Button>
    );
  };

  return (
    <div className="mt-8 flex w-full flex-col items-center justify-center gap-6 pb-8">
      {/* Profile Avatar - Centered */}
      <Avatar className="h-28 w-28">
        <AvatarImage src={userData?.avatar_url || ""} alt={displayName} />
        <AvatarFallback className="bg-primary font-bold text-2xl text-primary-foreground">
          {profileAddress?.substring(2, 4).toUpperCase() || "??"}
        </AvatarFallback>
      </Avatar>

      {/* Profile Info - Centered */}
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="font-semibold text-[28px] leading-[32px]">
          {displayName}
        </h1>
        <p className="font-medium text-[18px] text-muted-foreground leading-[24px]">
          {profileAddress}
        </p>
      </div>

      {/* Stats - Centered with separator */}
      <div className="flex items-center gap-2 font-medium text-muted-foreground">
        <span>
          <span className="font-semibold text-foreground">
            {followingCount}{" "}
          </span>
          Following
        </span>
        <p className="font-semibold text-muted-foreground/40">·</p>
        <span>
          <span className="font-semibold text-foreground">
            {followersCount}{" "}
          </span>
          Followers
        </span>
        <p className="font-semibold text-muted-foreground/40">·</p>
        <span>
          <span className="font-semibold text-foreground">{trackCount} </span>
          Tracks
        </span>
      </div>

      {/* Action Button - Full width */}
      <div className="w-full">{renderActionButtons()}</div>
    </div>
  );
}
