"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { usePostQuote } from "@/hooks/use-post-quote";
import { usePostRepost } from "@/hooks/use-post-repost";
import { ArrowsClockwise, ChatText } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

interface RepostQuoteButtonProps {
  postId: string;
  count?: number;
  showCount?: boolean;
  size?: "sm" | "default" | "lg" | "icon";
  variant?: "default" | "ghost" | "outline" | "secondary";
  className?: string;
  onRepostSubmit?: () => void;
  onQuoteSubmit?: () => void;
}

export function RepostQuoteButton({
  postId,
  count: initialCount = 0,
  showCount = true,
  size = "sm",
  variant = "ghost",
  className = "",
  onRepostSubmit,
  onQuoteSubmit,
}: RepostQuoteButtonProps) {
  // Track count locally
  const [currentCount, setCurrentCount] = useState(initialCount);

  // Update count if props change
  useEffect(() => {
    setCurrentCount(initialCount);
  }, [initialCount]);

  const incrementCount = () => {
    setCurrentCount((prev) => prev + 1);
  };

  const { isLoading: isRepostLoading, createRepost } = usePostRepost(postId, () => {
    incrementCount();
    onRepostSubmit?.();
  });

  const { isLoading: isQuoteLoading, createQuote } = usePostQuote(postId, () => {
    incrementCount();
    onQuoteSubmit?.();
  });

  const [quote, setQuote] = useState("");
  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleRepost = async () => {
    await createRepost();
    setIsDropdownOpen(false);
  };

  const handleQuoteSubmit = async () => {
    await createQuote(quote);
    setQuote("");
    setIsQuoteDialogOpen(false);
  };

  const openQuoteDialog = () => {
    setIsQuoteDialogOpen(true);
    setIsDropdownOpen(false);
  };

  // Handle click and prevent event propagation
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking button
  };

  return (
    <>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            size={size}
            variant={variant}
            className={`gap-1 px-2 text-muted-foreground ${className}`}
            onClick={handleClick}
          >
            <ArrowsClockwise className="size-4" weight="regular" />
            {showCount && <span>{currentCount}</span>}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem className="gap-2" onClick={handleRepost} disabled={isRepostLoading}>
            <ArrowsClockwise className="size-4" weight="regular" />
            <span>Repost</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2" onClick={openQuoteDialog}>
            <ChatText className="size-4" weight="regular" />
            <span>Quote post</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isQuoteDialogOpen} onOpenChange={setIsQuoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quote this post</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Add your thoughts..."
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
            rows={5}
            className="mt-2"
          />
          <DialogFooter>
            <Button
              onClick={handleQuoteSubmit}
              disabled={isQuoteLoading || !quote.trim()}
              className="mt-4"
            >
              {isQuoteLoading ? "Submitting..." : "Quote Post"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
