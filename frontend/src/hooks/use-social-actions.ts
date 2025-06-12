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
    mutationFn: async ({
      trackId,
      trackTitle,
    }: {
      trackId: string;
      trackTitle?: string;
    }) => {
      if (!address) throw new Error("User not connected");
      const result = await socialQueries.likes.toggle(address, trackId);
      return { ...result, trackTitle };
    },
    onMutate: async ({ trackId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["tracks"] });
      await queryClient.cancelQueries({ queryKey: ["track", trackId] });
      await queryClient.cancelQueries({ queryKey: ["user-likes", address] });

      // Snapshot the previous values for all tracks queries
      const previousTracksQueries = queryClient.getQueriesData({
        queryKey: ["tracks"],
      });
      const previousTrack = queryClient.getQueryData(["track", trackId]);
      const previousUserLikes = queryClient.getQueryData(["user-likes", address]);

      // Get current like status
      const userLikes = (previousUserLikes as any[]) || [];
      const isCurrentlyLiked = userLikes.some((like) => like.track_id === trackId);

      // Optimistically update all tracks queries
      queryClient.setQueriesData({ queryKey: ["tracks"] }, (old: any) => {
        if (!old?.data?.tracks) return old;

        return {
          ...old,
          data: {
            ...old.data,
            tracks: old.data.tracks.map((track: any) =>
              track.id === trackId
                ? {
                    ...track,
                    likes: isCurrentlyLiked ? track.likes - 1 : track.likes + 1,
                    isLiked: !isCurrentlyLiked,
                  }
                : track,
            ),
          },
        };
      });

      // Optimistically update single track
      queryClient.setQueryData(["track", trackId], (old: any) => {
        if (!old?.data) return old;

        return {
          ...old,
          data: {
            ...old.data,
            likes: isCurrentlyLiked ? old.data.likes - 1 : old.data.likes + 1,
            isLiked: !isCurrentlyLiked,
          },
        };
      });

      // Optimistically update user likes
      queryClient.setQueryData(["user-likes", address], (old: any) => {
        const oldLikes = old || [];
        if (isCurrentlyLiked) {
          return oldLikes.filter((like: any) => like.track_id !== trackId);
        } else {
          return [...oldLikes, { track_id: trackId, user_address: address }];
        }
      });

      return { previousTracksQueries, previousTrack, previousUserLikes };
    },
    onError: (err, { trackId }, context) => {
      // Rollback optimistic updates on error
      if (context?.previousTracksQueries) {
        context.previousTracksQueries.forEach(([queryKey, queryData]) => {
          queryClient.setQueryData(queryKey, queryData);
        });
      }
      if (context?.previousTrack) {
        queryClient.setQueryData(["track", trackId], context.previousTrack);
      }
      if (context?.previousUserLikes) {
        queryClient.setQueryData(["user-likes", address], context.previousUserLikes);
      }

      toast.error("Failed to update like");
      console.error("Like error:", err);
    },
    onSuccess: (data, { trackId }) => {
      // Invalidate to ensure data is fresh
      queryClient.invalidateQueries({ queryKey: ["track-likes", trackId] });
      queryClient.invalidateQueries({ queryKey: ["user-likes", address] });
      queryClient.invalidateQueries({ queryKey: ["tracks"] });
      queryClient.invalidateQueries({ queryKey: ["track", trackId] });

      // Show better toast message
      if (data.isLiked) {
        const message = data.trackTitle
          ? `${data.trackTitle} was saved to your library`
          : "Track saved to your library";
        toast.success(message);
      } else {
        const message = data.trackTitle
          ? `${data.trackTitle} was removed from your library`
          : "Track removed from your library";
        toast.success(message);
      }
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
    onMutate: async ({ trackId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["tracks"] });
      await queryClient.cancelQueries({ queryKey: ["track", trackId] });

      // Snapshot the previous value
      const previousTrack = queryClient.getQueryData(["track", trackId]);

      // Optimistically update all tracks queries
      queryClient.setQueriesData({ queryKey: ["tracks"] }, (old: any) => {
        if (!old?.data?.tracks) return old;

        return {
          ...old,
          data: {
            ...old.data,
            tracks: old.data.tracks.map((track: any) =>
              track.id === trackId ? { ...track, comments: track.comments + 1 } : track,
            ),
          },
        };
      });

      // Optimistically update single track
      queryClient.setQueryData(["track", trackId], (old: any) => {
        if (!old?.data) return old;

        return {
          ...old,
          data: {
            ...old.data,
            comments: old.data.comments + 1,
          },
        };
      });

      return { previousTrack };
    },
    onError: (err, { trackId }, context) => {
      // Rollback optimistic updates on error - just invalidate all tracks
      queryClient.invalidateQueries({ queryKey: ["tracks"] });
      if (context?.previousTrack) {
        queryClient.setQueryData(["track", trackId], context.previousTrack);
      }

      toast.error("Failed to add comment");
      console.error("Comment error:", err);
    },
    onSuccess: (data, { trackId }) => {
      queryClient.invalidateQueries({ queryKey: ["track-comments", trackId] });
      queryClient.invalidateQueries({ queryKey: ["tracks"] });
      queryClient.invalidateQueries({ queryKey: ["track", trackId] });
      toast.success("Comment added!");
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
      queryClient.invalidateQueries({
        queryKey: ["is-following", address, followingAddress],
      });
      queryClient.invalidateQueries({ queryKey: ["user", followingAddress] }); // Refresh follower count

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
 * Hook to check if current user is following another user
 */
export function useIsFollowing(followingAddress: string) {
  const { address } = useAccount();

  return useQuery({
    queryKey: ["is-following", address, followingAddress],
    queryFn: () => socialQueries.follows.isFollowing(address!, followingAddress),
    enabled: !!address && !!followingAddress && address !== followingAddress,
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
