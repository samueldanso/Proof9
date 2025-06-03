"use client";

import { Button } from "@/components/ui/button";
import { ChatCircle } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";

interface CommentButtonProps {
  postId: string;
  commentCount?: number;
  showCount?: boolean;
  size?: "sm" | "default" | "lg" | "icon";
  variant?: "default" | "ghost" | "outline" | "secondary";
  className?: string;
  username?: string;
}

export function CommentButton({
  postId,
  commentCount = 0,
  showCount = true,
  size = "sm",
  variant = "ghost",
  className = "",
  username,
}: CommentButtonProps) {
  const router = useRouter();

  // Navigate to post detail page for commenting
  const navigateToPostDetail = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking button
    router.push(`/posts/${username}/${postId}`);
  };

  return (
    <Button
      size={size}
      variant={variant}
      className={`gap-1 px-2 text-muted-foreground ${className}`}
      onClick={navigateToPostDetail}
    >
      <ChatCircle className="size-4" weight="regular" />
      {showCount && <span>{commentCount}</span>}
    </Button>
  );
}
