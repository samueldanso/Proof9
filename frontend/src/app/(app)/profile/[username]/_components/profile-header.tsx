"use client";

import { Button } from "@/components/ui/button";
import { useUser } from "@/lib/api/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useAccount } from "wagmi";
import { EditProfileDialog } from "./edit-profile-dialog";

import PencilIcon from "@/components/icons/pencil.svg";
import { getAvatarUrl } from "@/lib/avatar";
import { AddressDisplay } from "@/components/shared/address-display";
import { useFollow, useIsFollowing } from "@/hooks/use-social-actions";

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

  // Follow functionality
  const followMutation = useFollow();
  const { data: isFollowing, isLoading: isFollowLoading } = useIsFollowing(
    userData?.address || ""
  );

  const handleFollow = () => {
    if (!userData?.address) return;
    followMutation.mutate(userData.address);
  };

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
          className="gap-2 rounded-full px-8"
          onClick={() => setEditDialogOpen(true)}
        >
          <PencilIcon className="h-4 w-4" />
          Edit Profile
        </Button>
      );
    }

    // User viewing another profile - show Follow/Following
    const isUserFollowing = isFollowing || false;
    const isLoading = isFollowLoading || followMutation.isPending;

    return (
      <Button
        variant={isUserFollowing ? "secondary" : "default"}
        className="rounded-full px-8"
        onClick={handleFollow}
        disabled={isLoading || !connectedAddress}
        type="button"
      >
        {isLoading ? "..." : isUserFollowing ? "Following" : "Follow"}
      </Button>
    );
  };

  return (
    <div className="mt-8 flex w-full flex-col items-center justify-center gap-6 pb-8">
      {/* Profile Avatar - Centered */}
      <img
        src={getAvatarUrl(userData?.avatar_url)}
        alt="Profile"
        className="aspect-square w-[112px] overflow-hidden rounded-full bg-muted object-cover"
      />

      {/* Profile Info - Centered */}
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="font-semibold text-[28px] leading-[32px]">
          {displayName}
        </p>
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
