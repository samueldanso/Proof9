"use client";

import { PostCard } from "@/app/(app)/discover/_components/feed-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AnyPost, Post } from "@lens-protocol/client";
import { AlertCircleIcon } from "lucide-react";
import { useState } from "react";

// Use for mock data only - will be replaced with Lens API
interface MockPost {
  id: string;
  content: string;
  createdAt: Date;
  image?: string;
  collectible?: {
    price: string;
    currency: string;
    collected: number;
    total: number;
  };
  creator: {
    id: string;
    username: string;
    name: string;
    avatar?: string;
  };
}

interface CollectedPostsProps {
  username: string;
  isOwnProfile?: boolean;
}

export function CollectedPosts({
  username,
  isOwnProfile = false,
}: CollectedPostsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [posts, setPosts] = useState<MockPost[]>([]);
  const [hasError, setHasError] = useState(false);

  // Simulate fetching collected posts - in a real app this would call a Lens API
  // to get the posts collected by this user
  useState(() => {
    setIsLoading(true);

    // Mock implementation - in real implementation this would be populated from Lens API call
    setTimeout(() => {
      try {
        // Test data - in real implementation this would be populated from Lens API call
        if (username === "gamerbuild") {
          // Some mock data for our demo user
          setPosts([
            {
              id: "post-1",
              content:
                "New SaaS Productivity Tool - early believers get lifetime access!",
              createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
              collectible: {
                price: "5",
                currency: "GHO",
                collected: 28,
                total: 50,
              },
              creator: {
                id: "creator-1",
                username: "web3sarah",
                name: "Sarah Web3",
                avatar:
                  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format",
              },
            },
          ]);
        } else {
          setPosts([]);
        }
      } catch (err) {
        console.error("Error fetching collected posts:", err);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    }, 1000);
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[200px] w-full rounded-xl" />
        <Skeleton className="h-[200px] w-full rounded-xl" />
      </div>
    );
  }

  if (hasError) {
    return (
      <Card className="flex flex-col items-center justify-center p-6 text-center">
        <AlertCircleIcon className="mb-2 size-12 text-muted-foreground" />
        <h3 className="mb-1 font-semibold text-xl">Something went wrong</h3>
        <p className="mb-4 text-muted-foreground">
          We couldn't load the collected posts. Please try again later.
        </p>
        <Button onClick={() => window.location.reload()}>Refresh</Button>
      </Card>
    );
  }

  if (posts.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center p-6 text-center">
        <h3 className="mb-1 font-semibold text-xl">
          {isOwnProfile
            ? "You haven't collected any posts yet"
            : `${username} hasn't collected any posts yet`}
        </h3>
        <p className="mb-4 text-muted-foreground">
          {isOwnProfile
            ? "Explore the feed to find creators to support"
            : "Check back later to see what they've collected"}
        </p>
        {isOwnProfile && (
          <Button
            className="bg-[#00A8FF] text-white hover:bg-[#00A8FF]/90"
            asChild
          >
            <a href="/feed">Explore Feed</a>
          </Button>
        )}
      </Card>
    );
  }

  // Map our mock posts to the structure expected by the Lens AnyPost type
  const mappedPosts = posts.map((post) => ({
    __typename: "Post" as const,
    id: post.id,
    slug: post.id,
    isDeleted: false,
    isEdited: false,
    timestamp: post.createdAt.toISOString(),
    contentUri: `lens://contentUri/${post.id}`,
    snapshotUrl: `https://lens.xyz/snapshot/${post.id}`,
    app: {
      __typename: "App" as const,
      address: "0x0000000000000000000000000000000000000000",
      metadata: {
        name: "Believr",
        logo: "/logo.png",
      },
    },
    author: {
      address: post.creator.id,
      metadata: {
        name: post.creator.name,
        picture: post.creator.avatar,
      },
      username: {
        value: post.creator.username,
      },
    },
    metadata: {
      __typename: "TextOnlyMetadata" as const,
      content: post.content,
      id: post.id,
      locale: "en",
      tags: [],
      mainContentFocus: "TEXT_ONLY",
    },
    stats: {
      comments: 0,
      mirrors: 0,
      quotes: 0,
      bookmarks: 0,
      reactions: 0,
      collects: post.collectible?.collected || 0,
    },
    operations: {
      hasBookmarked: false,
      hasReacted: false,
      hasCollected: false,
      canComment: true,
      canMirror: true,
      canCollect: true,
    },
    feed: {
      __typename: "PostFeedInfo",
      address: "0x0000000000000000000000000000000000000000",
    },
    collectibleMetadata: {
      __typename: "NftMetadata",
      collection: post.collectible
        ? {
            __typename: "NftCollection",
            name: "Collectibles",
          }
        : null,
      id: post.id,
    },
    rules: {
      __typename: "PostRules",
      canComment: true,
      canMirror: true,
    },
    mentions: [],
    actions: post.collectible
      ? [
          {
            __typename: "SimpleCollectAction" as const,
            collectLimit: post.collectible.total.toString(),
            followerOnGraph: null,
            endsAt: null,
            isImmutable: true,
            address: post.creator.id,
            collectNftAddress: null,
          },
        ]
      : [],
  })) as any as AnyPost[]; // Use type assertion to fix immediate error since the mock data is incomplete

  return (
    <div className="space-y-6">
      {mappedPosts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
