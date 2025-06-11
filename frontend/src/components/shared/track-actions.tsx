"use client";

import IconBubble from "@/components/icons/bubble.svg";
import IconHeart from "@/components/icons/hearth.svg";
import IconHeartFill from "@/components/icons/hearthFill.svg";
import IconShare from "@/components/icons/share.svg";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";

interface TrackActionsProps {
  trackId: string;
  likes: number;
  comments: number;
  isLiked?: boolean;
  onLike?: (trackId: string) => void;
  onComment?: (trackId: string) => void;
  onShare?: (trackId: string) => void;
  showLicenseButton?: boolean;
  licensePrice?: string;
}

export function TrackActions({
  trackId,
  likes,
  comments,
  isLiked,
  onLike,
  onComment,
  onShare,
  showLicenseButton = true,
  licensePrice,
}: TrackActionsProps) {
  const router = useRouter();

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

  const handleBuyLicense = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/track/${trackId}`);
  };

  return (
    <div className="flex items-center justify-between">
      {/* Left Actions: Like & Comment */}
      <div className="flex items-center gap-4">
        {/* Like Button */}
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1 px-2 py-1 h-auto"
          onClick={handleLike}
        >
          {isLiked ? (
            <IconHeartFill className="h-4 w-4 text-red-500" />
          ) : (
            <IconHeart className="h-4 w-4" />
          )}
          <span className="text-sm">{likes}</span>
        </Button>

        {/* Comment Button */}
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1 px-2 py-1 h-auto"
          onClick={handleComment}
        >
          <IconBubble className="h-4 w-4" />
          <span className="text-sm">{comments}</span>
        </Button>

        {/* Share Button */}
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1 px-2 py-1 h-auto"
          onClick={handleShare}
        >
          <IconShare className="h-4 w-4" />
        </Button>
      </div>

      {/* License Button */}
      {showLicenseButton && (
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1 px-3 py-1 h-auto"
          onClick={handleBuyLicense}
        >
          <ShoppingCart className="h-3 w-3" />
          <span className="text-sm">
            {licensePrice ? `$${licensePrice}` : "License"}
          </span>
        </Button>
      )}
    </div>
  );
}
