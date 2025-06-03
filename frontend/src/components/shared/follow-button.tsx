"use client";

import { Button } from "@/components/ui/button";
import { useFollow } from "@/hooks/use-follow";
import { cn } from "@/lib/utils";
import { useAuthenticatedUser } from "@lens-protocol/react";
import { Check, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export interface FollowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * The user ID to follow
   */
  userId: string;
  /**
   * The username to follow (for navigation)
   */
  username: string;
  /**
   * Whether the user is already being followed
   */
  isFollowing?: boolean;
  /**
   * The size of the button
   */
  size?: "default" | "sm" | "lg" | "icon";
  /**
   * The variant of the button
   */
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  /**
   * Callback function when follow state changes
   */
  onFollowChange?: (isFollowing: boolean) => void;
  /**
   * Whether to show text inside the button
   */
  showText?: boolean;
  /**
   * Whether to use a rounded style
   */
  rounded?: boolean;
}

/**
 * A reusable button component for following/unfollowing users
 */
export function FollowButton({
  userId,
  username,
  isFollowing: initialIsFollowing = false,
  size = "default",
  variant: initialVariant = "default",
  onFollowChange,
  showText = true,
  rounded = false,
  className,
  ...props
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const { data: user } = useAuthenticatedUser();
  const { follow, unfollow, checkFollowStatus, isLoading } = useFollow();

  // Load initial follow status when component mounts or user changes
  useEffect(() => {
    const loadFollowStatus = async () => {
      if (user?.address) {
        const status = await checkFollowStatus(userId);
        setIsFollowing(status);
      }
    };

    loadFollowStatus();
  }, [userId, user, checkFollowStatus]);

  // Determine button variant based on follow state
  const variant = isFollowing ? "outline" : initialVariant;

  const handleFollow = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user?.address) {
      toast.error("Please sign in to follow users");
      return;
    }

    try {
      if (isFollowing) {
        // Unfollow
        const result = await unfollow(userId);

        if (result.isErr()) {
          throw new Error("Failed to unfollow");
        }

        setIsFollowing(false);
        toast.success(`Unfollowed @${username}`);
      } else {
        // Follow
        const result = await follow(userId);

        if (result.isErr()) {
          throw new Error("Failed to follow");
        }

        setIsFollowing(true);
        toast.success(`Followed @${username}`);
      }

      if (onFollowChange) {
        onFollowChange(!isFollowing);
      }
    } catch (error) {
      console.error("Error following/unfollowing:", error);
      toast.error("Failed to update follow status. Please try again.");
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleFollow}
      disabled={isLoading}
      className={cn(
        {
          "bg-[#00A8FF] text-white hover:bg-[#00A8FF]/90": !isFollowing && variant === "default",
          "rounded-full": rounded,
        },
        className,
      )}
      {...props}
    >
      {isLoading ? "" : showText ? (isFollowing ? "Following" : "Follow") : null}
      {!showText &&
        !isLoading &&
        (isFollowing ? <Check className="size-4" /> : <Plus className="size-4" />)}
    </Button>
  );
}
