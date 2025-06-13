"use client";

import IconBubble from "@/components/icons/bubble.svg";
import IconEllipsis from "@/components/icons/ellipsis.svg";
import IconHeart from "@/components/icons/hearth.svg";
import IconHeartFill from "@/components/icons/hearthFill.svg";
import IconShare from "@/components/icons/share.svg";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Music, ShoppingCart } from "lucide-react";
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
  trackTitle?: string;
  variant?: "compact" | "full"; // Add variant for different layouts
  ipAssetId?: string; // For remix functionality
  allowRemix?: boolean; // Whether this track allows remixes
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
  trackTitle,
  variant = "full",
  ipAssetId,
  allowRemix = true,
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

  const handleRemix = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Navigate to upload page with remix parameters
    const remixParams = new URLSearchParams({
      remix: "true",
      parentTrackId: trackId,
      ...(ipAssetId && { parentIpId: ipAssetId }),
      ...(trackTitle && { parentTitle: trackTitle }),
    });
    router.push(`/upload?${remixParams.toString()}`);
  };

  // Compact variant for grid cards
  if (variant === "compact") {
    return (
      <TooltipProvider>
        <div className="flex items-center gap-2">
          {/* Like Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex h-8 items-center gap-1.5 px-2 hover:bg-red-50 dark:hover:bg-red-950/20"
                onClick={handleLike}
              >
                {isLiked ? (
                  <IconHeartFill className="h-4 w-4 text-red-500" />
                ) : (
                  <IconHeart className="h-4 w-4 hover:text-red-500" />
                )}
                <span className="font-medium text-sm">{likes}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isLiked ? "Unlike" : "Like"}</p>
            </TooltipContent>
          </Tooltip>

          {/* Comment Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex h-8 items-center gap-1.5 px-2"
                onClick={handleComment}
              >
                <IconBubble className="h-4 w-4" />
                <span className="font-medium text-sm">{comments}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Comment</p>
            </TooltipContent>
          </Tooltip>

          {/* More Actions Dropdown */}
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <IconEllipsis className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>More actions</p>
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem onClick={handleShare}>
                <IconShare className="mr-2 h-4 w-4" />
                Share
              </DropdownMenuItem>
              {allowRemix && (
                <DropdownMenuItem onClick={handleRemix}>
                  <Music className="mr-2 h-4 w-4" />
                  Create Remix
                </DropdownMenuItem>
              )}
              {showLicenseButton && (
                <DropdownMenuItem onClick={handleBuyLicense}>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  {licensePrice ? `License $${licensePrice}` : "License"}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() =>
                  navigator.clipboard.writeText(`${window.location.origin}/track/${trackId}`)
                }
              >
                <IconShare className="mr-2 h-4 w-4" />
                Copy Link
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TooltipProvider>
    );
  }

  // Full variant for detailed views
  return (
    <TooltipProvider>
      <div className="flex items-center justify-between">
        {/* Left Actions: Like & Comment */}
        <div className="flex items-center gap-4">
          {/* Like Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex h-auto items-center gap-2 px-3 py-2 hover:bg-red-50 dark:hover:bg-red-950/20"
                onClick={handleLike}
              >
                {isLiked ? (
                  <IconHeartFill className="h-5 w-5 text-red-500" />
                ) : (
                  <IconHeart className="h-5 w-5 hover:text-red-500" />
                )}
                <span className="font-medium text-sm">{likes}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isLiked ? "Unlike" : "Like"}</p>
            </TooltipContent>
          </Tooltip>

          {/* Comment Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex h-auto items-center gap-2 px-3 py-2"
                onClick={handleComment}
              >
                <IconBubble className="h-5 w-5" />
                <span className="font-medium text-sm">{comments}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Comment</p>
            </TooltipContent>
          </Tooltip>

          {/* Share Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex h-auto items-center gap-2 px-3 py-2"
                onClick={handleShare}
              >
                <IconShare className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Share</p>
            </TooltipContent>
          </Tooltip>

          {/* Remix Button */}
          {allowRemix && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex h-auto items-center gap-2 px-3 py-2"
                  onClick={handleRemix}
                >
                  <Music className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Create Remix</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* License Button */}
        {showLicenseButton && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex h-auto items-center gap-2 px-4 py-2"
                onClick={handleBuyLicense}
              >
                <ShoppingCart className="h-4 w-4" />
                <span className="font-medium text-sm">
                  {licensePrice ? `$${licensePrice}` : "License"}
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Buy License</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
