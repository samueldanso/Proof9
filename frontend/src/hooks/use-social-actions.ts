import { socialQueries } from "@/lib/db";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAccount } from "wagmi";

// ==========================================
// SOCIAL HOOKS - MODERN CLEAN VERSION
// ==========================================

/**
 * Hook to like/unlike a track
 */
export function useLikeTrack() {
  const { address } = useAccount();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (trackId: string) => {
      if (!address) throw new Error("User not connected");
      return socialQueries.likes.toggle(address, trackId);
    },
    onSuccess: (data, trackId) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["track-likes", trackId] });
      queryClient.invalidateQueries({ queryKey: ["user-likes", address] });

      toast.success(data.isLiked ? "Track liked!" : "Track unliked!");
    },
    onError: (error) => {
      toast.error("Failed to update like");
      console.error("Like error:", error);
    },
  });
}

/**
 * Hook to add a comment
 */
export function useAddComment() {
  const { address } = useAccount();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      trackId,
      content,
    }: {
      trackId: string;
      content: string;
    }) => {
      if (!address) throw new Error("User not connected");
      return socialQueries.comments.add(address, trackId, content);
    },
    onSuccess: (data, { trackId }) => {
      queryClient.invalidateQueries({ queryKey: ["track-comments", trackId] });
      toast.success("Comment added!");
    },
    onError: (error) => {
      toast.error("Failed to add comment");
      console.error("Comment error:", error);
    },
  });
}

/**
 * Hook to follow/unfollow a user
 */
export function useFollow() {
  const { address } = useAccount();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (followingAddress: string) => {
      if (!address) throw new Error("User not connected");
      return socialQueries.follows.toggle(address, followingAddress);
    },
    onSuccess: (data, followingAddress) => {
      queryClient.invalidateQueries({
        queryKey: ["user-followers", followingAddress],
      });
      queryClient.invalidateQueries({ queryKey: ["user-following", address] });

      toast.success(data.isFollowing ? "Following!" : "Unfollowed!");
    },
    onError: (error) => {
      toast.error("Failed to update follow");
      console.error("Follow error:", error);
    },
  });
}

/**
 * Hook to get track comments
 */
export function useTrackComments(trackId: string) {
  return useQuery({
    queryKey: ["track-comments", trackId],
    queryFn: () => socialQueries.comments.getForTrack(trackId),
    enabled: !!trackId,
  });
}

/**
 * Hook to get track likes
 */
export function useTrackLikes(trackId: string) {
  return useQuery({
    queryKey: ["track-likes", trackId],
    queryFn: () => socialQueries.likes.getForTrack(trackId),
    enabled: !!trackId,
  });
}

/**
 * Hook to check if user liked a track
 */
export function useIsTrackLiked(trackId: string) {
  const { address } = useAccount();

  return useQuery({
    queryKey: ["track-liked", trackId, address],
    queryFn: () => socialQueries.likes.isLiked(address!, trackId),
    enabled: !!address && !!trackId,
  });
}

/**
 * Hook to get user's liked tracks
 */
export function useUserLikes() {
  const { address } = useAccount();

  return useQuery({
    queryKey: ["user-likes", address],
    queryFn: () => socialQueries.likes.getUserLiked(address!),
    enabled: !!address,
  });
}

/**
 * Hook to get user's followers
 */
export function useUserFollowers(userAddress: string) {
  return useQuery({
    queryKey: ["user-followers", userAddress],
    queryFn: () => socialQueries.follows.getFollowers(userAddress),
    enabled: !!userAddress,
  });
}

/**
 * Hook to get user's following
 */
export function useUserFollowing(userAddress: string) {
  return useQuery({
    queryKey: ["user-following", userAddress],
    queryFn: () => socialQueries.follows.getFollowing(userAddress),
    enabled: !!userAddress,
  });
}

/**
 * Combined hook for all social actions (backward compatibility)
 */
export function useSocialActions() {
  const likeTrack = useLikeTrack();
  const addComment = useAddComment();
  const follow = useFollow();

  return {
    likeTrack: likeTrack.mutate,
    addComment: (trackId: string, content: string) => addComment.mutate({ trackId, content }),
    follow: follow.mutate,
    isLoading: likeTrack.isPending || addComment.isPending || follow.isPending,
  };
}

// Legacy exports for backward compatibility
export const {
  useLikeTrack: useLikeTrackSupabase,
  useAddComment: useAddCommentSupabase,
  useTrackComments: useTrackCommentsSupabase,
  useTrackLikes: useTrackLikesSupabase,
  useIsTrackLiked: useIsTrackLikedSupabase,
  useUserLikes: useUserLikesSupabase,
  useSocialActions: useSocialActionsSupabase,
} = {
  useLikeTrack,
  useAddComment,
  useTrackComments,
  useTrackLikes,
  useIsTrackLiked,
  useUserLikes,
  useSocialActions,
};
