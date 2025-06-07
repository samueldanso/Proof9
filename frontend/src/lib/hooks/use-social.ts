import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { useLikeTrack, useAddComment } from "@/lib/api/hooks";
import { toast } from "sonner";

export function useSocialActions() {
  const { address } = useAccount();
  const queryClient = useQueryClient();

  const likeTrackMutation = useLikeTrack();
  const addCommentMutation = useAddComment();

  const toggleLike = async (trackId: string) => {
    if (!address) {
      toast.error("Please connect your wallet to like tracks");
      return;
    }

    try {
      // Optimistic update
      queryClient.setQueryData(["tracks"], (oldData: any) => {
        if (!oldData?.data?.tracks) return oldData;

        return {
          ...oldData,
          data: {
            ...oldData.data,
            tracks: oldData.data.tracks.map((track: any) =>
              track.id === trackId
                ? {
                    ...track,
                    isLiked: !track.isLiked,
                    likes: track.isLiked ? track.likes - 1 : track.likes + 1,
                  }
                : track
            ),
          },
        };
      });

      // Make API call
      const result = await likeTrackMutation.mutateAsync({
        userAddress: address,
        trackId,
      });

      // Update with real data
      queryClient.setQueryData(["tracks"], (oldData: any) => {
        if (!oldData?.data?.tracks) return oldData;

        return {
          ...oldData,
          data: {
            ...oldData.data,
            tracks: oldData.data.tracks.map((track: any) =>
              track.id === trackId
                ? {
                    ...track,
                    isLiked: result.data.isLiked,
                    likes: result.data.totalLikes,
                  }
                : track
            ),
          },
        };
      });

      toast.success(result.data.isLiked ? "Track liked!" : "Like removed");
    } catch (error) {
      // Revert optimistic update on error
      queryClient.invalidateQueries({ queryKey: ["tracks"] });
      toast.error("Failed to update like");
    }
  };

  const addComment = async (trackId: string, content: string) => {
    if (!address) {
      toast.error("Please connect your wallet to comment");
      return;
    }

    if (!content.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    try {
      const result = await addCommentMutation.mutateAsync({
        userAddress: address,
        trackId,
        content: content.trim(),
      });

      // Invalidate comments to refetch
      queryClient.invalidateQueries({ queryKey: ["comments", trackId] });

      toast.success("Comment added!");
      return result.data;
    } catch (error) {
      toast.error("Failed to add comment");
    }
  };

  return {
    toggleLike,
    addComment,
    isLiking: likeTrackMutation.isPending,
    isCommenting: addCommentMutation.isPending,
  };
}
