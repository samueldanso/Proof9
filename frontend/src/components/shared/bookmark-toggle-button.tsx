"use client";

import { Button } from "@/components/ui/button";
import { usePostBookmark } from "@/hooks/use-post-bookmark";
import { Bookmark } from "@phosphor-icons/react";

interface BookmarkToggleButtonProps {
  postId: string;
  isBookmarked?: boolean;
  onRemove?: () => void;
}

export function BookmarkToggleButton({
  postId,
  isBookmarked: initialState = false,
  onRemove,
}: BookmarkToggleButtonProps) {
  // Use our custom hook for bookmark functionality
  const { isBookmarked, isLoading, toggleBookmark } = usePostBookmark(
    postId,
    initialState,
    onRemove,
  );

  // Handle click and prevent event propagation
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking button
    toggleBookmark();
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className={`size-8 rounded-full ${
        isBookmarked ? "text-primary" : "text-muted-foreground hover:text-primary"
      }`}
      onClick={handleClick}
      isLoading={isLoading}
    >
      {!isLoading && <Bookmark className="size-5" weight={isBookmarked ? "fill" : "regular"} />}
    </Button>
  );
}
