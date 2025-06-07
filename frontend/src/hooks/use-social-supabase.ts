import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import {
  addTrackComment,
  getTrackComments,
  getTrackLikes,
  getUserLikedTracks,
  isTrackLiked,
  toggleTrackLike,
} from "@/lib/supabase-queries";
import { toast } from "sonner";

// ==========================================
// SOCIAL HOOKS - SUPABASE VERSION
// ==========================================

/**
 * Hook to like/unlike a track
 */
export function useLikeTrackSupabase() {
  const { address } = useAccount();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (trackId: string) => {
      if (!address) throw new Error("User not connected");
      return toggleTrackLike(address, trackId);
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
export function useAddCommentSupabase() {
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
      return addTrackComment(address, trackId, content);
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
 * Hook to get track comments
 */
export function useTrackCommentsSupabase(trackId: string) {
  return useQuery({
    queryKey: ["track-comments", trackId],
    queryFn: () => getTrackComments(trackId),
    enabled: !!trackId,
  });
}

/**
 * Hook to get track likes
 */
export function useTrackLikesSupabase(trackId: string) {
  return useQuery({
    queryKey: ["track-likes", trackId],
    queryFn: () => getTrackLikes(trackId),
    enabled: !!trackId,
  });
}

/**
 * Hook to check if user liked a track
 */
export function useIsTrackLikedSupabase(trackId: string) {
  const { address } = useAccount();

  return useQuery({
    queryKey: ["track-liked", trackId, address],
    queryFn: () => isTrackLiked(address!, trackId),
    enabled: !!address && !!trackId,
  });
}

/**
 * Hook to get user's liked tracks
 */
export function useUserLikesSupabase() {
  const { address } = useAccount();

  return useQuery({
    queryKey: ["user-likes", address],
    queryFn: () => getUserLikedTracks(address!),
    enabled: !!address,
  });
}

/**
 * Combined hook for all social actions (like the current one)
 */
export function useSocialActionsSupabase() {
  const likeTrack = useLikeTrackSupabase();
  const addComment = useAddCommentSupabase();

  return {
    likeTrack: likeTrack.mutate,
    addComment: (trackId: string, content: string) =>
      addComment.mutate({ trackId, content }),
    isLoading: likeTrack.isPending || addComment.isPending,
  };
}
