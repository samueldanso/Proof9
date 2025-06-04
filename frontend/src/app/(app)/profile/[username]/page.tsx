"use client";

import { SearchBar } from "@/components/shared/search-bar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getLensClient } from "@/lib/lens/client";
import { Account, AccountStats, PageSize, Post, evmAddress } from "@lens-protocol/client";
import { fetchAccountStats } from "@lens-protocol/client/actions";
import { fetchAccount } from "@lens-protocol/client/actions";
import { useAccount, usePosts } from "@lens-protocol/react";
import { useParams, useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import { PostCard } from "../../discover/_components/feed-card";
import { type Campaign, type Creator, Trending } from "../../discover/_components/trending-banner";
import { TrendingSkeleton } from "../../discover/_components/trending-skeleton";
import { ProfileHeader } from "./_components/profile-header";
import { ProfileSkeleton } from "./_components/profile-skeleton";

function TrendingContent() {
  // Use real Lens data instead of mock data for trending posts
  const { data, loading, error } = usePosts({
    filter: {
      metadata: {
        // Focus on posts with visual content for trending section
        mainContentFocus: ["IMAGE", "VIDEO"],
      },
    },
    pageSize: PageSize.Ten,
  });

  if (loading || error || !data?.items.length) {
    return <Trending creators={[]} campaigns={[]} />;
  }

  // Transform Lens posts directly to the component props
  const trendingPosts: Campaign[] = data.items
    .filter((post): post is Post => post.__typename === "Post")
    .slice(0, 5)
    .map((post) => {
      // Extract title from post metadata or use content snippet
      let title = "";
      if (post.metadata.__typename === "ArticleMetadata") {
        title = post.metadata.title || "Untitled Post";
      } else if (post.metadata.__typename === "TextOnlyMetadata") {
        title = post.metadata.content || "Untitled Post";
      } else if (post.metadata.__typename === "ImageMetadata" && post.metadata.content) {
        title = post.metadata.content.slice(0, 50) + "..." || "Untitled Post";
      } else if (post.metadata.__typename === "VideoMetadata" && post.metadata.content) {
        title = post.metadata.content.slice(0, 50) + "..." || "Untitled Post";
      } else if (post.metadata.__typename === "AudioMetadata" && post.metadata.content) {
        title = post.metadata.content.slice(0, 50) + "..." || "Untitled Post";
      } else {
        title = "Untitled Post";
      }

      // Extract username from profile
      const username =
        post.author.username?.value?.split("/").pop() || post.author.address.substring(0, 8);

      // Extract profile picture
      let picture = "";
      if (typeof post.author.metadata?.picture === "string") {
        picture = post.author.metadata.picture;
      } else if (post.author.metadata?.picture) {
        picture = post.author.metadata.picture.item || "";
      }

      return {
        id: post.id,
        title: title,
        creator: {
          id: post.author.address,
          name: post.author.metadata?.name || username,
          username: username,
          picture: picture,
        },
        collectible: {
          price: "0",
          currency: "ETH",
          collected: post.stats.collects || 0,
          total: 100,
        },
      };
    });

  // Use just the top creators
  const topCreators: Creator[] = data.items
    .filter((post): post is Post => post.__typename === "Post")
    .slice(0, 3)
    .map((post) => {
      const author = post.author;
      const username = author.username?.value?.split("/").pop() || author.address.substring(0, 8);

      // Extract profile picture
      let picture = "";
      if (typeof author.metadata?.picture === "string") {
        picture = author.metadata.picture;
      } else if (author.metadata?.picture) {
        picture = author.metadata.picture.item || "";
      }

      return {
        id: author.address,
        name: author.metadata?.name || username,
        username: username,
        picture: picture,
        stats: {
          followers: 0, // We don't have this data
          collects: post.stats.collects || 0,
        },
      };
    });

  return <Trending creators={topCreators} campaigns={trendingPosts} />;
}

function ProfileContent({ username }: { username: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "posts";
  const [account, setAccount] = useState<Account | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [accountStats, setAccountStats] = useState<AccountStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use the Lens useAccount hook directly
  const {
    data: lensAccount,
    loading: accountLoading,
    error: accountError,
  } = useAccount({
    username: {
      localName: username,
    },
  });

  // Fetch posts by this user
  const {
    data: postsData,
    loading: postsLoading,
    error: postsError,
  } = usePosts({
    filter: lensAccount
      ? {
          authors: [evmAddress(lensAccount.address)],
        }
      : undefined,
    pageSize: PageSize.Ten,
  });

  // Fetch account stats separately
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<Error | null>(null);

  // Set the account when it's loaded
  useEffect(() => {
    if (lensAccount) {
      setAccount(lensAccount);
    }
  }, [lensAccount]);

  // Fetch account stats
  useEffect(() => {
    async function fetchStats() {
      if (!lensAccount) return;

      setStatsLoading(true);
      try {
        const client = await getLensClient();
        const result = await fetchAccountStats(client, {
          account: lensAccount.address,
        });

        if (result.isOk()) {
          setAccountStats(result.value);
        } else {
          setStatsError(result.error);
        }
      } catch (error) {
        setStatsError(error instanceof Error ? error : new Error(String(error)));
      } finally {
        setStatsLoading(false);
      }
    }

    if (lensAccount) {
      fetchStats();
    }
  }, [lensAccount]);

  // Show error toast if there was a problem fetching the profile
  useEffect(() => {
    if (accountError || statsError || postsError) {
      console.error("Error loading profile data:", accountError || statsError || postsError);
      toast.error("Failed to load profile data");
    }
  }, [accountError, statsError, postsError]);

  const loadUserData = async (username: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const client = await getLensClient();
      // Try to find the account by username or address
      const accountResult = await fetchAccount(client, {
        // Check if it looks like an address
        ...(username.startsWith("0x") && username.length >= 40
          ? { address: username }
          : { username: { localName: username.replace(/^lens\//, "") } }),
      });

      if (accountResult.isErr()) {
        // Try alternative lookup method
        const alternativeResult = await fetchAccount(client, {
          // If we tried username first, now try as address
          ...(username.startsWith("0x") && username.length >= 40
            ? { username: { localName: username.replace(/^lens\//, "") } }
            : { address: username }),
        });

        if (alternativeResult.isErr()) {
          throw new Error(`Could not find account: ${accountResult.error.message}`);
        }

        // Use the alternate lookup result
        if (!alternativeResult.value) {
          throw new Error(`Account not found: ${username}`);
        }

        setAccount(alternativeResult.value);

        // Get account stats
        const statsResult = await fetchAccountStats(client, {
          ...(alternativeResult.value.address ? { account: alternativeResult.value.address } : {}),
        });

        if (statsResult.isErr()) {
          console.error("Error fetching account stats:", statsResult.error);
        } else {
          setAccountStats(statsResult.value);
        }
      } else {
        // Success with primary lookup method
        if (!accountResult.value) {
          throw new Error(`Account not found: ${username}`);
        }

        setAccount(accountResult.value);

        // Get account stats
        const statsResult = await fetchAccountStats(client, {
          ...(accountResult.value.address ? { account: accountResult.value.address } : {}),
        });

        if (statsResult.isErr()) {
          console.error("Error fetching account stats:", statsResult.error);
        } else {
          setAccountStats(statsResult.value);
        }
      }

      // Get account posts (mock data for now)
      // TODO: Implement real post fetching using Lens SDK
      setPosts([]);
    } catch (err) {
      console.error("Error loading user data:", err);
      setError(`Failed to load user profile. ${err instanceof Error ? err.message : ""}`);
      toast.error(`Failed to load user profile. ${err instanceof Error ? err.message : ""}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Decode username as it may be URL-encoded
    const decodedUsername = decodeURIComponent(username);
    loadUserData(decodedUsername);
  }, [username]);

  // Handle follow state changes
  const handleFollowChange = (isFollowing: boolean, newFollowerCount: number) => {
    if (accountStats) {
      setAccountStats({
        ...accountStats,
        graphFollowStats: {
          ...accountStats.graphFollowStats,
          followers: newFollowerCount,
        },
      });
    }
  };

  const loading = accountLoading || statsLoading;

  if (loading) {
    return null; // This won't be seen as the Suspense fallback will be shown instead
  }

  if (accountError || statsError) {
    return (
      <div className="flex h-80 flex-col items-center justify-center text-center">
        <h2 className="mb-2 font-semibold text-xl">Error Loading Profile</h2>
        <p className="mb-4 text-muted-foreground">
          We encountered a problem while trying to load this profile.
        </p>
        <Button onClick={() => router.push("/feed")}>Return to Feed</Button>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="flex h-80 flex-col items-center justify-center text-center">
        <h2 className="mb-2 font-semibold text-xl">Profile not found</h2>
        <p className="mb-4 text-muted-foreground">
          The profile you're looking for doesn't exist or has been removed.
        </p>
        <Button onClick={() => router.push("/feed")}>Return to Feed</Button>
      </div>
    );
  }

  return (
    <div className="w-full px-4 pb-12 md:px-6">
      {/* Grid layout for main content and sidebar - Structure similar to feed page */}
      <div className="flex flex-col gap-6 md:flex-row">
        {/* Main Profile Content - Takes full width on mobile, flex-1 on desktop */}
        <div className="flex-1">
          <ProfileHeader
            account={account}
            stats={accountStats}
            onFollowChange={handleFollowChange}
          />

          <div className="mt-6">
            <Tabs defaultValue={tab}>
              <TabsList className="mb-6 w-full">
                <TabsTrigger className="flex-1" value="posts">
                  Posts
                </TabsTrigger>
                <TabsTrigger className="flex-1" value="collects">
                  Collections
                </TabsTrigger>
                <TabsTrigger className="flex-1" value="about">
                  About
                </TabsTrigger>
              </TabsList>

              <TabsContent value="posts">
                {postsData && postsData.items.length > 0 ? (
                  <div className="space-y-6">
                    {postsData.items
                      .filter((post): post is Post => post.__typename === "Post")
                      .map((post) => (
                        <PostCard key={post.id} post={post} />
                      ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed p-8 text-center">
                    <p className="text-muted-foreground">No posts yet</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="collects">
                <div className="rounded-lg border border-dashed p-8 text-center">
                  <p className="text-muted-foreground">No collections yet</p>
                </div>
              </TabsContent>

              <TabsContent value="about">
                <div className="space-y-6 rounded-lg border p-6">
                  <div>
                    <h2 className="mb-4 font-bold text-xl">About</h2>
                    <p>{account.metadata?.bio || "No bio available"}</p>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="mb-4 font-semibold text-lg">On-chain Info</h3>
                    <div className="rounded-lg bg-muted p-4">
                      <p className="break-all font-mono text-muted-foreground text-xs">
                        {account.address}
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Right Sidebar - Fixed width on desktop, hidden on mobile */}
        <div className="hidden w-[320px] md:block">
          <div className="sticky top-20 space-y-6">
            <Suspense fallback={<TrendingSkeleton />}>
              <TrendingContent />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;

  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfileContent username={username} />
    </Suspense>
  );
}
