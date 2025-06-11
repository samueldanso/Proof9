"use client";

import { TrackCard } from "@/components/shared/track-card";
import { useUser, useUserTracks } from "@/lib/api/hooks";
import { useTracks } from "@/lib/api/hooks";
import { transformDbTrackToLegacy } from "@/lib/api/types";
import { useLikeTrack, useAddComment } from "@/hooks/use-social-actions";
import { useParams } from "next/navigation";
import { toast } from "sonner";

export function TrackList() {
  const params = useParams();
  const profileIdentifier = params.identifier as string;

  // Get user data to get the address
  const { data: userResponse } = useUser(profileIdentifier);
  const userData = userResponse?.data;

  // Get user's track IDs
  const { data: userTracksResponse, isLoading: isLoadingUserTracks } =
    useUserTracks(userData?.address || "");
  const userTrackIds = userTracksResponse?.data?.tracks || [];

  // Get all tracks to filter by user's tracks
  const { data: allTracksResponse, isLoading: isLoadingAllTracks } =
    useTracks("following");
  const allTracks = allTracksResponse?.data?.tracks || [];

  // Filter tracks to only show user's tracks and transform them
  const userTracks = allTracks
    .filter((track) => userTrackIds.includes(track.id))
    .map(transformDbTrackToLegacy);

  const isLoading = isLoadingUserTracks || isLoadingAllTracks;

  // Social actions hooks
  const likeTrackMutation = useLikeTrack();
  const addCommentMutation = useAddComment();

  const handlePlay = (track: any) => {
    console.log("Playing track:", track);
    // Handle play logic - this would integrate with the music player
  };

  const handleLike = (trackId: string) => {
    likeTrackMutation.mutate(trackId, {
      onError: (error) => {
        toast.error("Failed to like track");
        console.error("Like error:", error);
      },
    });
  };

  const handleComment = (trackId: string) => {
    const comment = prompt("Add a comment:");
    if (comment) {
      addCommentMutation.mutate(
        { trackId, content: comment },
        {
          onError: (error) => {
            toast.error("Failed to add comment");
            console.error("Comment error:", error);
          },
        }
      );
    }
  };

  const handleShare = (trackId: string) => {
    const url = `${window.location.origin}/track/${trackId}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Track link copied to clipboard!");
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-32 w-full bg-muted rounded"></div>
          <div className="h-32 w-full bg-muted rounded"></div>
          <div className="h-32 w-full bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {userTracks.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-6 text-center">
          <h3 className="mb-3 font-bold text-xl">No sounds published yet</h3>
          <p className="text-muted-foreground">
            Your registered sounds will appear here
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-1">
          {userTracks.map((track) => (
            <TrackCard
              key={track.id}
              track={track}
              onPlay={handlePlay}
              onLike={handleLike}
              onComment={handleComment}
              onShare={handleShare}
              showArtist={false}
              variant="profile"
            />
          ))}
        </div>
      )}
    </div>
  );
}
