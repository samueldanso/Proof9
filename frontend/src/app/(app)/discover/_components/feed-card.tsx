"use client";

import { BelieveButton } from "@/components/shared/believe-button";
import { BookmarkToggleButton } from "@/components/shared/bookmark-toggle-button";
import { CommentButton } from "@/components/shared/comment-button";
import { ImageModal } from "@/components/shared/image-modal";
import { ReactionButton } from "@/components/shared/reaction-button";
import { RepostQuoteButton } from "@/components/shared/repost-quote-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { useLensPostUtils } from "@/hooks/use-lens-post-utils";
import { FormatPostContent } from "@/lib/format-content";
import { cn } from "@/lib/utils";
import { AnyPost, Post } from "@lens-protocol/client";
import { CurrencyDollar, Image as ImageIcon, MusicNote, Video } from "@phosphor-icons/react";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface FeedCardProps {
  post: AnyPost;
}

export function FeedCard({ post }: FeedCardProps) {
  const router = useRouter();
  const postUtils = useLensPostUtils();

  // Handle only Post types for now (not reposts, quotes, etc.)
  if (post.__typename !== "Post") {
    return null;
  }

  const typedPost = post as Post;

  // Extract post data using utility functions
  const content = postUtils.getContent(typedPost);
  const username = postUtils.getUsername(typedPost);
  const profilePicture = postUtils.getProfilePicture(typedPost);
  const isCollectible = postUtils.isCollectible(typedPost);

  // Create formatted date
  const timestamp = new Date(typedPost.timestamp);

  // Extract media from the post based on metadata type
  let mediaElement = null;

  // Handle Image metadata
  if (typedPost.metadata.__typename === "ImageMetadata" && typedPost.metadata.image) {
    const imageUrl = postUtils.getImageUrl(typedPost);

    if (imageUrl) {
      mediaElement = (
        <div className="mb-3">
          <ImageModal
            src={imageUrl}
            alt={postUtils.getTitle(typedPost)}
            className="relative aspect-[4/3] overflow-hidden rounded-lg"
          />
        </div>
      );
    }
  }

  // Handle Video metadata
  else if (typedPost.metadata.__typename === "VideoMetadata" && typedPost.metadata.video) {
    const videoUrl = postUtils.getVideoUrl(typedPost);
    const posterUrl = postUtils.getVideoPosterUrl(typedPost);

    if (videoUrl) {
      mediaElement = (
        <div className="mb-3 overflow-hidden rounded-lg">
          <div className="relative aspect-video">
            <video
              src={videoUrl}
              controls
              poster={posterUrl}
              className="h-full w-full object-cover"
              onClick={(e) => e.stopPropagation()}
            >
              <track kind="captions" label="English" srcLang="en" default />
              Your browser does not support the video element.
            </video>
          </div>
        </div>
      );
    } else {
      // Fallback for when video URL can't be determined
      mediaElement = (
        <div className="mb-3 flex aspect-video items-center justify-center rounded-lg bg-muted">
          <Video className="size-12 text-muted-foreground" weight="bold" />
        </div>
      );
    }
  }

  // Handle Audio metadata
  else if (typedPost.metadata.__typename === "AudioMetadata" && typedPost.metadata.audio) {
    const audioUrl = postUtils.getAudioUrl(typedPost);

    if (audioUrl) {
      mediaElement = (
        <div className="mb-3 rounded-lg border p-4">
          <div className="mb-2 flex items-center gap-3">
            <MusicNote className="size-6 text-primary" weight="bold" />
            <span className="font-medium">{postUtils.getTitle(typedPost)}</span>
          </div>
          <audio controls className="w-full" onClick={(e) => e.stopPropagation()}>
            <source src={audioUrl} />
            <track kind="captions" label="English" srcLang="en" default />
            Your browser does not support the audio element.
          </audio>
        </div>
      );
    }
  }

  // Check if post has a collect action and collect limit
  const collectLimit = postUtils.getCollectLimit(typedPost);

  // Handle navigation to post detail page
  const navigateToPostDetail = () => {
    router.push(`/posts/${username}/${typedPost.id}`);
  };

  return (
    <Card className="cursor-pointer overflow-hidden" onClick={navigateToPostDetail}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Avatar className="size-10">
            <AvatarImage src={profilePicture} alt={typedPost.author.metadata?.name || username} />
            <AvatarFallback>
              {(typedPost.author.metadata?.name?.[0] || username[0])?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-1">
              <span
                className="cursor-pointer font-medium"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/u/${username}`);
                }}
              >
                {typedPost.author.metadata?.name || username}
              </span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground text-sm">
              <span className="font-semibold text-[14px]">@{username}</span>
              <span>•</span>
              <span>{formatDistanceToNow(timestamp, { addSuffix: true })}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        {content && (
          <div className="mb-3 whitespace-pre-wrap font-medium text-[16px]">
            <FormatPostContent content={content} />
          </div>
        )}

        {/* Media element (image, video, audio) */}
        {mediaElement}
      </CardContent>

      <CardFooter className="pt-0">
        <div className="flex w-full items-center justify-between">
          <div className="flex gap-4">
            <CommentButton
              postId={typedPost.id}
              commentCount={typedPost.stats?.comments || 0}
              username={username}
            />
            <RepostQuoteButton
              postId={typedPost.id}
              count={(typedPost.stats?.reposts || 0) + (typedPost.stats?.quotes || 0)}
            />
            <ReactionButton
              postId={typedPost.id}
              reactionCount={typedPost.stats?.upvotes || 0}
              isReacted={typedPost.operations?.hasUpvoted}
            />
          </div>

          <div className="flex gap-2">
            <BookmarkToggleButton
              postId={typedPost.id}
              isBookmarked={typedPost.operations?.hasBookmarked}
            />
            {isCollectible && <BelieveButton postId={typedPost.id} username={username} />}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
