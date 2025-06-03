"use client";

import { Button } from "@/components/ui/button";
import { usePostReaction } from "@/hooks/use-post-reaction";
import { Heart } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

interface ReactionButtonProps {
  postId: string;
  isReacted?: boolean;
  reactionCount?: number;
  showCount?: boolean;
  size?: "sm" | "default" | "lg" | "icon";
  variant?: "default" | "ghost" | "outline" | "secondary";
  className?: string;
  onReactionChange?: (isReacted: boolean) => void;
}

export function ReactionButton({
  postId,
  isReacted: initialReacted = false,
  reactionCount: initialReactionCount = 0,
  showCount = true,
  size = "sm",
  variant = "ghost",
  className = "",
  onReactionChange,
}: ReactionButtonProps) {
  // Track reaction count locally
  const [currentCount, setCurrentCount] = useState(initialReactionCount);

  // Use our custom hook for reaction functionality
  const { isReacted, isLoading, toggleReaction } = usePostReaction(
    postId,
    initialReacted,
    (newReactedState) => {
      // Update the count when reaction state changes
      if (newReactedState) {
        // Incremented when reacted
        setCurrentCount((prev) => prev + 1);
      } else {
        // Decremented when unreacted
        setCurrentCount((prev) => Math.max(0, prev - 1));
      }
      // Call the parent callback if provided
      onReactionChange?.(newReactedState);
    },
  );

  // If initial props change, update the local state
  useEffect(() => {
    setCurrentCount(initialReactionCount);
  }, [initialReactionCount]);

  // Handle click and prevent event propagation
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking button
    toggleReaction();
  };

  return (
    <Button
      size={size}
      variant={variant}
      className={`gap-1 ${
        isReacted ? "text-red-500" : "text-muted-foreground hover:text-red-500"
      } ${className}`}
      onClick={handleClick}
      isLoading={isLoading}
    >
      {!isLoading && (
        <>
          <Heart className="size-4" weight={isReacted ? "fill" : "regular"} />
          {showCount && <span>{currentCount}</span>}
        </>
      )}
    </Button>
  );
}
