"use client";

import { BookmarkToggleButton } from "@/components/shared/bookmark-toggle-button";
import { ImageModal } from "@/components/shared/image-modal";
import { ReactionButton } from "@/components/shared/reaction-button";
import { RepostQuoteButton } from "@/components/shared/repost-quote-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormatPostContent } from "@/lib/format-content";
import { getLensClient } from "@/lib/lens/client";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, Loader2, MessageCircleIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CollectCard } from "./_components/collect-card";
import { CollectorsList } from "./_components/collectors-list";
import { CommentSection } from "./_components/comment-section";
import { InvestmentTerms } from "./_components/investment-terms";

// Interface for investment metadata
interface InvestmentMetadata {
  category: "content" | "art" | "music" | "tech" | "writing";
  revenueShare: string;
  benefits: string;
  endDate: string;
  mediaType?: "image" | "video" | "audio";
}

// Type for post attributes
interface PostAttribute {
  key: string;
  value: string;
  type?: string;
}

// Extended Post type to include attributes we know exist but aren't typed
interface ExtendedPostMetadata {
  attributes?: PostAttribute[];
}

export default function PostPage() {
  const router = useRouter();
  const params = useParams();
  const lensPostId = params.id as string;
  const creatorUsername = params.username as string;

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCollected, setHasCollected] = useState(false);
  const [investmentMetadata, setInvestmentMetadata] = useState<InvestmentMetadata | null>(null);

  // Fetch the post data from Lens Protocol
  useEffect(() => {
    const loadPost = async () => {
      setIsLoading(true);
      try {
        // Get the Lens client
        const client = await getLensClient();

        // Fetch the post data using the fetchPost function from the SDK
        const result = await fetchPost(client, {
          post: postId(lensPostId),
        });

        if (result.isErr()) {
          toast.error("Failed to load post");
          console.error(result.error);
          setIsLoading(false);
          return;
        }

        const postData = result.value as Post;
        if (!postData) {
          toast.error("Post not found");
          setIsLoading(false);
          return;
        }

        // Store the post
        setPost(postData);

        // Extract investment metadata if this is an investment post
        // Cast to ExtendedPostMetadata to access attributes property
        const attributes = (postData.metadata as unknown as ExtendedPostMetadata)?.attributes;
        if (
          attributes?.some(
            (attr: PostAttribute) => attr.key === "type" && attr.value === "investment",
          )
        ) {
          const metadata: Partial<InvestmentMetadata> = {};

          attributes.forEach((attr: PostAttribute) => {
            switch (attr.key) {
              case "category":
                metadata.category = attr.value as InvestmentMetadata["category"];
                break;
              case "revenueShare":
                metadata.revenueShare = attr.value;
                break;
              case "benefits":
                metadata.benefits = attr.value;
                break;
              case "endDate":
                metadata.endDate = attr.value;
                break;
              case "mediaType":
                metadata.mediaType = attr.value as InvestmentMetadata["mediaType"];
                break;
            }
          });

          setInvestmentMetadata(metadata as InvestmentMetadata);
        }

        // Fetch comments for the post
        const commentsResult = await fetchPostReferences(client, {
          referenceTypes: [PostReferenceType.CommentOn],
          referencedPost: postId(lensPostId),
        });

        if (commentsResult.isOk()) {
          // Filter to get only Post type comments
          const commentPosts = commentsResult.value.items.filter(
            (item) => item.__typename === "Post",
          ) as Post[];

          setComments(commentPosts);
        } else {
          console.error("Failed to fetch comments:", commentsResult.error);
        }

        // Check if user has collected this post (simplified implementation for now)
        setHasCollected(false);
      } catch (error) {
        console.error("Error loading post:", error);
        toast.error("Failed to load post details");
      } finally {
        setIsLoading(false);
      }
    };

    loadPost();
  }, [lensPostId, creatorUsername]);

  // Handle collect action
  const handleCollect = () => {
    if (post) {
      // Update local state to reflect collection (simplified)
      // In a real implementation, this would trigger an actual collect transaction
      toast.success("Collected post!");
    }
  };

  // Handle adding a new comment
  const handleCommentAdded = (newComment: Post) => {
    // Check if the comment already exists in the list (avoid duplicates)
    if (!comments.some((comment) => comment.id === newComment.id)) {
      // Add the new comment to the beginning of the list
      setComments((prev) => [newComment, ...prev]);

      // Update comment count in post stats
      if (post) {
        setPost({
          ...post,
          stats: {
            ...post.stats,
            comments: (post.stats?.comments || 0) + 1,
          },
        });
      }
    }
  };

  // Handle reaction change
  const handleReactionChange = (isReacted: boolean) => {
    if (post) {
      // Update local reaction count (simplified)
      // In a real implementation, this would be handled by a query refresh
      toast.success(isReacted ? "Reaction added!" : "Reaction removed!");
    }
  };

  // Handle repost/quote count change
  const handleRepostChange = () => {
    if (post) {
      // Update local repost count (simplified)
      // In a real implementation, this would be handled by a query refresh
      toast.success("Post shared!");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-80 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex h-80 flex-col items-center justify-center text-center">
        <h2 className="mb-2 font-semibold text-xl">Post not found</h2>
        <p className="mb-4 text-muted-foreground">
          The post you're looking for doesn't exist or has been removed.
        </p>
        <Button onClick={() => router.push("/feed")}>Back to Feed</Button>
      </div>
    );
  }

  // Extract post metadata
  const timestamp = new Date(post.timestamp);
  const timeAgo = formatDistanceToNow(timestamp, { addSuffix: true });

  // Get username
  const username =
    post.author.username?.value?.split("/").pop() || post.author.address.substring(0, 8);

  // Get collect action if any
  const collectAction = post.actions?.find((action) => action.__typename === "SimpleCollectAction");

  // Get image URL if available
  const imageUrl = (() => {
    if (post.metadata?.__typename === "ImageMetadata" && post.metadata.image) {
      if (typeof post.metadata.image === "string") {
        return post.metadata.image;
      }
      return post.metadata.image.item || "";
    }
    return "";
  })();

  // Get content based on metadata type
  const content = (() => {
    if (!post.metadata) return "";

    if (post.metadata.__typename === "TextOnlyMetadata") {
      return post.metadata.content;
    } else if (post.metadata.__typename === "ArticleMetadata") {
      return post.metadata.content;
    } else if (post.metadata.__typename === "ImageMetadata") {
      return post.metadata.content;
    } else if (post.metadata.__typename === "VideoMetadata") {
      return post.metadata.content;
    } else if (post.metadata.__typename === "AudioMetadata") {
      return post.metadata.content;
    } else {
      return (post.metadata as any)?.content || "";
    }
  })();

  // Get title based on metadata type
  const title = (() => {
    if (!post.metadata) return "Untitled Post";

    if (post.metadata.__typename === "ArticleMetadata") {
      return post.metadata.title || "Untitled Post";
    } else if (post.metadata.__typename === "VideoMetadata") {
      return post.metadata.title || "Untitled Post";
    } else if (post.metadata.__typename === "AudioMetadata") {
      return post.metadata.title || "Untitled Post";
    } else {
      return (post.metadata as any)?.title || "Untitled Post";
    }
  })();

  // Get author picture
  const authorPicture = (() => {
    const pic = post.author.metadata?.picture;
    if (!pic) return "";
    if (typeof pic === "string") return pic;
    return pic.item || "";
  })();

  // Check if this is an investment post
  const isInvestmentPost = investmentMetadata !== null;

  // Prepare investment terms if available
  const investmentTerms = isInvestmentPost
    ? {
        goal: Number.parseFloat(
          collectAction?.__typename === "SimpleCollectAction"
            ? collectAction.payToCollect?.amount?.value || "0"
            : "0",
        ),
        deadline: investmentMetadata?.endDate ? new Date(investmentMetadata.endDate) : undefined,
        description: `${investmentMetadata?.revenueShare || "0"}% revenue share for believers`,
      }
    : null;

  return (
    <div className="w-full px-4 pb-12 md:px-6">
      <Button
        variant="ghost"
        className="mb-6 flex items-center gap-1 px-0"
        onClick={() => router.back()}
      >
        <ArrowLeft className="size-4" />
        Back
      </Button>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr,320px]">
        {/* Main Content Column */}
        <div>
          <Card className="overflow-hidden">
            {imageUrl && (
              <div className="w-full overflow-hidden">
                <ImageModal src={imageUrl} alt={title} className="relative aspect-video w-full" />
              </div>
            )}

            <div className="p-6">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Avatar
                    className="size-10 cursor-pointer"
                    onClick={() => router.push(`/u/${username}`)}
                  >
                    <AvatarImage src={authorPicture} alt={post.author.metadata?.name || username} />
                    <AvatarFallback>
                      {(post.author.metadata?.name?.[0] || username[0]).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-1">
                      <h3
                        className="font-semibold hover:underline"
                        onClick={() => router.push(`/u/${username}`)}
                      >
                        {post.author.metadata?.name || username}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1">
                      <p className="text-muted-foreground text-sm">@{username}</p>
                      <span className="text-muted-foreground text-xs">•</span>
                      <span className="text-muted-foreground text-xs">{timeAgo}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <ReactionButton
                    postId={post.id}
                    reactionCount={post.stats?.upvotes || 0}
                    isReacted={post.operations?.hasUpvoted || false}
                    onReactionChange={handleReactionChange}
                    variant="ghost"
                    size="icon"
                  />
                  <RepostQuoteButton
                    postId={post.id}
                    count={(post.stats?.reposts || 0) + (post.stats?.quotes || 0)}
                    variant="ghost"
                    size="icon"
                    onRepostSubmit={handleRepostChange}
                    onQuoteSubmit={handleRepostChange}
                  />
                  <BookmarkToggleButton
                    postId={post.id}
                    isBookmarked={post.operations?.hasBookmarked}
                  />
                </div>
              </div>

              <h1 className="mb-4 font-bold text-2xl">{title}</h1>

              {/* Investment category badge */}
              {isInvestmentPost && (
                <div className="mb-4">
                  <Badge
                    variant="outline"
                    className="border-[#00A8FF]/30 bg-[#00A8FF]/10 text-[#00A8FF]"
                  >
                    {investmentMetadata?.category.charAt(0).toUpperCase() +
                      investmentMetadata?.category.slice(1)}{" "}
                    Investment
                  </Badge>
                </div>
              )}

              <div className="whitespace-pre-line text-base">
                <FormatPostContent content={content} />
              </div>

              {/* Investment Terms - Only shown on mobile */}
              {isInvestmentPost && investmentTerms && (
                <div className="mt-8 lg:hidden">
                  <InvestmentTerms
                    terms={investmentTerms}
                    collectedAmount={post.stats?.collects || 0}
                    currency={
                      collectAction?.__typename === "SimpleCollectAction"
                        ? collectAction.payToCollect?.amount?.asset?.symbol || "WGHO"
                        : "WGHO"
                    }
                  />

                  {/* Benefits Section */}
                  {investmentMetadata?.benefits && (
                    <div className="mt-6">
                      <h3 className="mb-2 font-semibold text-lg">Benefits for Believers</h3>
                      <div className="whitespace-pre-line rounded-md bg-muted/50 p-4">
                        {investmentMetadata.benefits}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-8">
                <Tabs defaultValue="comments">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="comments">
                      <MessageCircleIcon className="mr-2 size-4" />
                      Comments ({comments.length})
                    </TabsTrigger>
                    <TabsTrigger value="collectors">
                      <Badge className="mr-2 bg-[#00A8FF]">{post.stats?.collects || 0}</Badge>
                      Believers
                    </TabsTrigger>
                  </TabsList>
                  <Separator className="my-4" />
                  <TabsContent value="comments" className="mt-0 pt-4">
                    <CommentSection
                      postId={post.id}
                      comments={comments}
                      onCommentAdded={handleCommentAdded}
                    />
                  </TabsContent>
                  <TabsContent value="collectors" className="mt-0 pt-4">
                    <CollectorsList postId={post.id} collectors={[]} />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar Column - Visible on desktop in normal order, appears first on mobile */}
        <div className="order-first lg:order-none">
          {isInvestmentPost ? (
            <>
              <CollectCard
                postId={post.id}
                price={
                  collectAction?.__typename === "SimpleCollectAction"
                    ? collectAction.payToCollect?.amount?.value || "0"
                    : "0"
                }
                currency={
                  collectAction?.__typename === "SimpleCollectAction"
                    ? collectAction.payToCollect?.amount?.asset?.symbol || "WGHO"
                    : "WGHO"
                }
                collected={post.stats?.collects || 0}
                total={
                  collectAction?.__typename === "SimpleCollectAction"
                    ? collectAction.collectLimit || 100
                    : 100
                }
                creator={{
                  id: post.author.address,
                  username,
                  name: post.author.metadata?.name || username,
                  avatar: authorPicture,
                  bio: post.author.metadata?.bio || undefined,
                  stats: {
                    followers: 0, // Would need an additional API call
                    believers: post.stats?.collects || 0,
                  },
                }}
                benefits={investmentMetadata?.benefits}
                onCollect={handleCollect}
              />

              {/* Investment Terms (Desktop Only) */}
              {investmentTerms && (
                <div className="hidden lg:block">
                  <InvestmentTerms
                    terms={investmentTerms}
                    collectedAmount={post.stats?.collects || 0}
                    currency={
                      collectAction?.__typename === "SimpleCollectAction"
                        ? collectAction.payToCollect?.amount?.asset?.symbol || "WGHO"
                        : "WGHO"
                    }
                  />

                  {/* Benefits Section */}
                  {investmentMetadata?.benefits && (
                    <div className="mt-4">
                      <h3 className="mb-2 font-semibold text-lg">Benefits for Believers</h3>
                      <div className="whitespace-pre-line rounded-md bg-muted/50 p-4">
                        {investmentMetadata.benefits}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <CollectCard
              postId={post.id}
              price={"0"}
              currency={"WGHO"}
              collected={post.stats?.collects || 0}
              total={
                collectAction?.__typename === "SimpleCollectAction"
                  ? collectAction.collectLimit || 100
                  : 100
              }
              creator={{
                id: post.author.address,
                username,
                name: post.author.metadata?.name || username,
                avatar: authorPicture,
                stats: {
                  followers: 0, // Would need an additional API call
                  believers: post.stats?.collects || 0,
                },
              }}
              onCollect={handleCollect}
            />
          )}
        </div>
      </div>
    </div>
  );
}
