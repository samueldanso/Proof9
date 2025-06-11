"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useTrackComments, useAddComment } from "@/hooks/use-social-actions";
import { getAvatarUrl, getUserInitials } from "@/lib/avatar";
import { useState } from "react";
import { useAccount } from "wagmi";
import { toast } from "sonner";

interface CommentsSectionProps {
  trackId: string;
}

export default function CommentsSection({ trackId }: CommentsSectionProps) {
  const { address } = useAccount();
  const { data: comments = [], isLoading } = useTrackComments(trackId);
  const addCommentMutation = useAddComment();
  const [newComment, setNewComment] = useState("");

  const handleAddComment = () => {
    if (!address) {
      toast.error("Please connect your wallet to comment");
      return;
    }

    if (!newComment.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    addCommentMutation.mutate(
      { trackId, content: newComment.trim() },
      {
        onSuccess: () => {
          setNewComment("");
        },
      }
    );
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className="p-6" id="comments-section">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">
            Comments ({comments.length})
          </h3>
        </div>

        {/* Add Comment Form */}
        {address && (
          <div className="space-y-3">
            <div className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={getAvatarUrl(null)} alt="Your avatar" />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {getUserInitials(formatAddress(address))}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[80px] resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={handleAddComment}
                disabled={!newComment.trim() || addCommentMutation.isPending}
                size="sm"
              >
                {addCommentMutation.isPending ? "Posting..." : "Post Comment"}
              </Button>
            </div>
          </div>
        )}

        {!address && (
          <div className="rounded-lg border border-dashed border-muted-foreground/25 p-4 text-center">
            <p className="text-muted-foreground text-sm">
              Connect your wallet to leave a comment
            </p>
          </div>
        )}

        <Separator />

        {/* Comments List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-24 rounded bg-muted" />
                    <div className="h-4 w-full rounded bg-muted" />
                    <div className="h-4 w-3/4 rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : comments.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">No comments yet</p>
              <p className="text-muted-foreground text-sm">
                Be the first to share your thoughts!
              </p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={getAvatarUrl(null)}
                    alt="Commenter avatar"
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {getUserInitials(formatAddress(comment.user_address))}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      {formatAddress(comment.user_address)}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {formatDate(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed">{comment.content}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
  );
}
