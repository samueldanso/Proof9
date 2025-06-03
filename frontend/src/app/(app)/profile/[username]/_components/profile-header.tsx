"use client";

import { FollowButton } from "@/components/shared/follow-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useFollowers } from "@/hooks/use-followers";
import { extractMediaUrl } from "@/lib/url-utils";
import { Account, AccountStats } from "@lens-protocol/client";
import { User } from "@phosphor-icons/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ProfileHeaderProps {
  account: Account;
  stats: AccountStats | null;
  onFollowChange: (isFollowing: boolean, newFollowerCount: number) => void;
}

export function ProfileHeader({ account, stats, onFollowChange }: ProfileHeaderProps) {
  const router = useRouter();
  const { followers, following, isLoadingFollowers } = useFollowers({
    accountAddress: account.address,
    pageSize: 5, // Load just a small amount to get the count
  });

  // Use stats from Lens API or fallback to local state if not yet loaded
  const [followerCount, setFollowerCount] = useState(
    stats?.graphFollowStats?.followers || followers.total || 0,
  );
  const [followingCount, setFollowingCount] = useState(
    stats?.graphFollowStats?.following || following.total || 0,
  );

  // State for image loading errors
  const [coverImageError, setCoverImageError] = useState(false);
  const [profileImageError, setProfileImageError] = useState(false);

  // Update follower counts when data changes
  useEffect(() => {
    if (followers.total > 0) {
      setFollowerCount(followers.total);
    }
  }, [followers.total]);

  useEffect(() => {
    if (following.total > 0) {
      setFollowingCount(following.total);
    }
  }, [following.total]);

  const handleFollowChange = (isFollowing: boolean) => {
    const newFollowerCount = isFollowing ? followerCount + 1 : followerCount - 1;
    setFollowerCount(newFollowerCount);
    onFollowChange(isFollowing, newFollowerCount);
  };

  // Extract data from the Lens account
  const username = account.username?.value
    ? account.username.value.split("/").pop() || account.username.value
    : account.address.substring(0, 8);
  const name = account.metadata?.name || username;
  const bio = account.metadata?.bio;

  // Get profile picture
  const picture = extractMediaUrl(account.metadata?.picture);

  // Get cover picture
  const coverPicture = extractMediaUrl(
    (account.metadata as any)?.coverPhoto || account.metadata?.coverPicture,
  );

  return (
    <div>
      {/* Cover image */}
      <div className="relative mb-16 h-48 w-full overflow-hidden rounded-xl md:h-64">
        {coverPicture && !coverImageError ? (
          <Image
            src={coverPicture}
            alt="Cover"
            fill
            sizes="(max-width: 768px) 100vw, 800px"
            className="object-cover"
            priority
            onError={() => {
              console.error(`Failed to load cover image: ${coverPicture}`);
              setCoverImageError(true);
            }}
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-r from-blue-500 to-purple-500" />
        )}

        {/* Profile avatar - positioned to overlap cover and content */}
        <div className="absolute bottom-[-40px] left-6 rounded-full border-4 border-background md:left-8">
          <Avatar className="size-32">
            {picture && !profileImageError ? (
              <AvatarImage
                src={picture}
                alt={name}
                onError={() => {
                  console.error(`Failed to load profile image: ${picture}`);
                  setProfileImageError(true);
                }}
              />
            ) : (
              <AvatarFallback className="flex items-center justify-center bg-muted text-2xl">
                <User className="size-16 text-muted-foreground" weight="bold" />
              </AvatarFallback>
            )}
          </Avatar>
        </div>

        {/* Follow button */}
        <div className="absolute right-4 bottom-4 md:right-8">
          <FollowButton
            userId={account.address}
            username={username}
            onFollowChange={handleFollowChange}
          />
        </div>
      </div>

      {/* Profile info */}
      <div className="mb-6">
        <div className="flex flex-col justify-between md:flex-row">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-2xl">{name}</h1>
            </div>
            <p className="text-muted-foreground">@{username}</p>
          </div>

          <div className="mt-4 flex flex-wrap gap-8 text-sm md:mt-0">
            <div>
              <span className="font-semibold">{followerCount}</span>
              <span className="ml-1 text-muted-foreground">Followers</span>
            </div>
            <div>
              <span className="font-semibold">{followingCount}</span>
              <span className="ml-1 text-muted-foreground">Following</span>
            </div>
          </div>
        </div>

        {/* Bio */}
        {bio && <p className="mt-4">{bio}</p>}

        {/* We don't currently have location and website from Lens API */}
        {/* These could be determined from metadata attributes in a future enhancement */}
        <div className="mt-4 flex flex-wrap gap-4">
          {/* Will be implemented when we extract location from metadata attributes */}
        </div>
      </div>
    </div>
  );
}
