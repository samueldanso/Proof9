"use client";

import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnyPost } from "@lens-protocol/graphql";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { PostCard } from "../../../discover/_components/feed-card";

interface ProfileTabsProps {
  posts: readonly AnyPost[];
  activeTab?: "posts" | "collectibles";
  onTabChange?: (tab: string) => void;
  loading?: boolean;
}

export function ProfileTabs({
  posts,
  activeTab = "posts",
  onTabChange,
  loading,
}: ProfileTabsProps) {
  const router = useRouter();
  // Filter for posts with SimpleCollectAction
  const collectiblePosts = posts.filter((post) => {
    if (post.__typename !== "Post") return false;
    return post.actions?.some((action) => action.__typename === "SimpleCollectAction");
  });

  const handleTabChange = (value: string) => {
    if (onTabChange) {
      onTabChange(value);
    }
  };

  const renderLoading = () => (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="size-8 animate-spin text-primary" />
    </div>
  );

  const renderPosts = (postsToRender: readonly AnyPost[]) => {
    if (loading) {
      return renderLoading();
    }

    if (postsToRender.length === 0) {
      return (
        <Card className="flex h-40 flex-col items-center justify-center text-center">
          <p className="text-muted-foreground">No posts yet</p>
        </Card>
      );
    }

    return postsToRender.map((post) => <PostCard key={post.id} post={post} />);
  };

  return (
    <Tabs defaultValue={activeTab} onValueChange={handleTabChange}>
      <TabsList className="mb-4 grid w-full max-w-md grid-cols-2">
        <TabsTrigger value="posts">Posts</TabsTrigger>
        <TabsTrigger value="collectibles">Collectibles</TabsTrigger>
      </TabsList>

      <TabsContent value="posts" className="space-y-4">
        {renderPosts(posts)}
      </TabsContent>

      <TabsContent value="collectibles" className="space-y-4">
        {loading ? (
          renderLoading()
        ) : collectiblePosts.length === 0 ? (
          <Card className="flex h-40 flex-col items-center justify-center text-center">
            <p className="text-muted-foreground">No collectible posts yet</p>
          </Card>
        ) : (
          collectiblePosts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </TabsContent>
    </Tabs>
  );
}
