"use client";

import IconBubble from "@/components/icons/bubble.svg";
import IconHeart from "@/components/icons/hearth.svg";
import IconHeartFill from "@/components/icons/hearthFill.svg";
import IconShare from "@/components/icons/share.svg";
import { Button } from "@/components/ui/button";

interface TrackActionsProps {
  trackId: string;
  likes: number;
  comments: number;
  isLiked?: boolean;
  onLike?: (trackId: string) => void;
  onComment?: (trackId: string) => void;
  onShare?: (trackId: string) => void;
}

export function TrackActions({
  trackId,
  likes,
  comments,
  isLiked = false,
  onLike,
  onComment,
  onShare,
}: TrackActionsProps) {
  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onLike?.(trackId);
  };

  const handleComment = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onComment?.(trackId);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onShare?.(trackId);
  };

  return (
    <div className="flex items-center justify-between">
      {/* Left Actions: Like & Comment */}
      <div className="flex items-center gap-4">
        {/* Like Button */}
        <Button
          variant="ghost"
          size="sm"
          className="h-auto gap-2 p-0 text-muted-foreground hover:text-foreground"
          onClick={handleLike}
        >
          {isLiked ? (
            <IconHeartFill className="h-5 w-5 text-red-500" />
          ) : (
            <IconHeart className="h-5 w-5" />
          )}
          <span className="text-sm">{likes}</span>
        </Button>

        {/* Comment Button */}
        <Button
          variant="ghost"
          size="sm"
          className="h-auto gap-2 p-0 text-muted-foreground hover:text-foreground"
          onClick={handleComment}
        >
          <IconBubble className="h-5 w-5" />
          <span className="text-sm">{comments}</span>
        </Button>
      </div>

      {/* Right Actions: Share */}
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="sm"
          className="h-auto p-0 text-muted-foreground hover:text-foreground"
          onClick={handleShare}
        >
          <IconShare className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
