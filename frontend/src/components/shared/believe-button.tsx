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
import { SessionClient, postId as createPostId } from "@lens-protocol/client";
import { executePostAction } from "@lens-protocol/client/actions";
import { CheckCheck, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export interface BelieveButtonProps {
  postId: string;
  username?: string;
  creatorUsername?: string; // Added to support both naming conventions
  isBelieved?: boolean;
  price?: string;
  currency?: string;
  className?: string;
  onBelieveChange?: (isBelieved: boolean) => void;
}

export function BelieveButton({
  postId,
  username,
  creatorUsername,
  isBelieved: externalBelieved,
  price,
  currency,
  className = "",
  onBelieveChange,
}: BelieveButtonProps) {
  // Use either username or creatorUsername, preferring creatorUsername if provided
  const displayUsername = creatorUsername || username || "";

  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // Use external state if provided, otherwise manage internally
  const [internalBelieved, setInternalBelieved] = useState(false);

  // Use the external state if provided, otherwise use internal state
  const believed = externalBelieved !== undefined ? externalBelieved : internalBelieved;

  const handleBelieve = async () => {
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

      try {
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
          console.error("Failed to collect post:", result.error);
          toast.error("Failed to collect post");
          setIsLoading(false);
          return;
        }

        setShowModal(false);

        // Update internal state if not controlled externally
        if (externalBelieved === undefined) {
          setInternalBelieved(true);
        }

        // Notify parent component if callback provided
        if (onBelieveChange) {
          onBelieveChange(true);
        }

        toast.success("You are now an early believer!");
      } catch (error) {
        console.error("Failed to collect post:", error);
        toast.error("Failed to collect post");
      }
    } catch (error) {
      console.error("Error collecting post:", error);
      toast.error("Failed to collect post");
    } finally {
      setIsLoading(false);
    }
  };

  if (believed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className={`gap-1 text-green-500 hover:text-green-600 ${className}`}
            >
              <CheckCheck className="size-4" />
              <span>Believed</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>You're an early believer!</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <>
      <Button
        size="sm"
        variant="default"
        className={`gap-1 ${className}`}
        onClick={() => setShowModal(true)}
      >
        <Star className="size-4" />
        <span>Believe{price ? ` · ${price} ${currency}` : ""}</span>
      </Button>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center">Become an Early Believer</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center">
            <p className="mb-4">
              You're about to believe in @{displayUsername}'s journey! Early believers get special
              perks and recognition.
            </p>
            {price && (
              <p className="mb-4 font-medium">
                Cost: {price} {currency}
              </p>
            )}
            <ul className="mb-4 space-y-2 text-left">
              <li className="flex items-center gap-2">
                <CheckCheck className="size-4 text-green-500" />
                <span>Early believer badge</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCheck className="size-4 text-green-500" />
                <span>Priority access to future updates</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCheck className="size-4 text-green-500" />
                <span>Shared on-chain proof of belief</span>
              </li>
            </ul>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleBelieve} disabled={isLoading}>
              {isLoading ? "Processing..." : "Believe Now"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
