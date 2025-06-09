"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { useAccount } from "wagmi";
import { useUser } from "@/lib/api/hooks";
import { EditProfileDialog } from "./edit-profile-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { AddressDisplay } from "@/components/shared/address-display";
import { getAvatarUrl, getUserInitials } from "@/lib/utils/avatar";

export function ProfileHeader() {
  const params = useParams();
  const { address: connectedAddress } = useAccount();
  const queryClient = useQueryClient();
  const profileIdentifier = params.username as string;
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Get user data from API (works with both username and address)
  const { data: userResponse, isLoading } = useUser(profileIdentifier);
  const userData = userResponse?.data;

  // Check if this is the current user's profile (compare addresses)
  const isOwnProfile =
    connectedAddress?.toLowerCase() === userData?.address?.toLowerCase();

  const displayName =
    userData?.displayName ||
    (userData?.address
      ? `${userData.address.substring(0, 6)}...${userData.address.substring(
          userData.address.length - 4
        )}`
      : "Unknown");

  // Get stats from API or default to 0
  const trackCount = userData?.trackCount || 0;
  const followingCount = userData?.followingCount || 0;
  const followersCount = userData?.followersCount || 0;

  const handleProfileUpdate = () => {
    // Invalidate the user query to refetch updated data
    queryClient.invalidateQueries({ queryKey: ["user", profileIdentifier] });
  };

  const renderActionButtons = () => {
    if (isOwnProfile) {
      // User viewing their own profile - show Edit Profile
      return (
        <Button
          variant="outline"
          className="px-8"
          onClick={() => setEditDialogOpen(true)}
        >
          Edit Profile
        </Button>
      );
    }

    // User viewing another profile - show Follow
    return (
      <Button variant="default" className="px-8">
        Follow
      </Button>
    );
  };

  return (
    <div className="mt-8 flex w-full flex-col items-center justify-center gap-6 pb-8">
      {/* Profile Avatar - Centered */}
      <div className="relative">
        <Avatar className="h-28 w-28 ring-2 ring-border shadow-xl">
          <AvatarImage
            src={getAvatarUrl(userData?.avatar_url)}
            alt={displayName}
            className="object-cover object-center"
          />
          <AvatarFallback className="bg-primary font-bold text-2xl text-primary-foreground">
            {getUserInitials(userData?.displayName || userData?.address)}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Profile Info - Centered */}
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="font-semibold text-[28px] leading-[32px]">
          {displayName}
        </h1>
        {userData?.address && (
          <AddressDisplay
            address={userData.address}
            className="justify-center"
          />
        )}
      </div>

      {/* Stats - Centered with separator */}
      <div className="flex items-center gap-2 font-medium text-muted-foreground">
        <span>
          <span className="font-semibold text-foreground">{trackCount} </span>
          Sounds
        </span>
        <p className="font-semibold text-muted-foreground/40">·</p>
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
      </div>

      {/* Action Button - Centered */}
      <div className="flex w-full justify-center">{renderActionButtons()}</div>

      {/* Edit Profile Dialog */}
      <EditProfileDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        currentDisplayName={userData?.displayName || ""}
        currentUsername={userData?.username}
        currentAvatarUrl={userData?.avatar_url}
        onProfileUpdate={handleProfileUpdate}
      />
    </div>
  );
}
