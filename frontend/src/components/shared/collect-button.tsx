"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getLensClient } from "@/lib/lens/client";
import { formatLensError, logLensError } from "@/lib/lens/error-handler";
import { cn } from "@/lib/utils";
import { SessionClient, postId as createPostId } from "@lens-protocol/client";
import { executePostAction } from "@lens-protocol/client/actions";
import { Star } from "@phosphor-icons/react";
import { useState } from "react";
import { toast } from "sonner";

export interface CollectButtonProps {
  postId: string;
  username?: string;
  collectCount?: number;
  collectLimit?: number | null;
  hasSimpleCollected?: boolean;
  className?: string;
  onCollectChange?: (hasCollected: boolean, newCollectCount: number) => void;
}

export function CollectButton({
  postId,
  username,
  collectCount = 0,
  collectLimit,
  hasSimpleCollected: externalHasCollected,
  className = "",
  onCollectChange,
}: CollectButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // Use external state if provided, otherwise manage internally
  const [internalHasCollected, setInternalHasCollected] = useState(false);
  const [internalCollectCount, setInternalCollectCount] = useState(collectCount);

  // Use the external state if provided, otherwise use internal state
  const isCollected =
    externalHasCollected !== undefined ? externalHasCollected : internalHasCollected;
  const currentCollectCount = collectCount !== undefined ? collectCount : internalCollectCount;

  const handleCollect = async () => {
    setIsLoading(true);

    try {
      const client = await getLensClient();

      if (!client) {
        toast.error("Failed to initialize Lens client");
        setIsLoading(false);
        return;
      }

      // Check if client is a SessionClient (has authentication)
      if (!("getCredentials" in client)) {
        toast.error("You need to be authenticated to collect a post");
        setIsLoading(false);
        return;
      }

      const sessionClient = client as SessionClient;

      // Create a post ID from the string
      const lensPostId = createPostId(postId);

      // Execute the post action to collect
      const result = await executePostAction(sessionClient, {
        post: lensPostId,
        action: {
          simpleCollect: {
            selected: true,
          },
        },
      });

      if (result.isErr()) {
        // Use our custom error handler for better error messages
        logLensError("collecting post", result.error);
        toast.error(`Failed to collect: ${formatLensError(result.error)}`);
        setIsLoading(false);
        return;
      }

      // The operation completed successfully
      const txHash = "hash" in result.value ? result.value.hash : null;
      if (txHash) {
        console.log("Collection transaction hash:", txHash);
      }

      setShowModal(false);

      // Update internal state if not controlled externally
      if (externalHasCollected === undefined) {
        setInternalHasCollected(true);
        setInternalCollectCount((prev) => prev + 1);
      }

      // Notify parent component if callback provided
      if (onCollectChange) {
        onCollectChange(true, currentCollectCount + 1);
      }

      toast.success("Post collected successfully!");
    } catch (error) {
      // Use our custom error handler for general errors
      logLensError("collect initialization", error);
      toast.error(`Failed to collect: ${formatLensError(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  // If already collected, show a static button
  if (isCollected) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className={cn("flex items-center gap-1 text-green-500", className)}
              onClick={(e) => e.stopPropagation()}
            >
              <Star className="h-4 w-4 fill-green-500" weight="fill" />
              <span>{currentCollectCount}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>You've collected this post</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <>
      <Button
        size="sm"
        variant="ghost"
        className={cn("flex items-center gap-1", className)}
        onClick={(e) => {
          e.stopPropagation();
          setShowModal(true);
        }}
      >
        <Star className="h-4 w-4" />
        <span>{currentCollectCount}</span>
      </Button>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle className="text-center">Collect this Post</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center">
            <p className="mb-4">
              Collect this post {username ? `by @${username}` : ""} to own it as an NFT on the
              blockchain.
            </p>

            {collectLimit && (
              <p className="text-muted-foreground text-sm">
                Limited collection: {currentCollectCount} of {collectLimit} collected
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleCollect} disabled={isLoading} className="gap-1">
              {isLoading ? "Processing..." : "Collect now"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
