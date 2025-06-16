"use client";

import { TrackCard } from "@/components/shared/track-card";
import { useTracks, useUser, useUserTracks } from "@/hooks/api";
import { useAddComment, useLikeTrack } from "@/hooks/use-social-actions";
import type { Track } from "@/types/track";
import { useParams } from "next/navigation";
import { toast } from "sonner";

interface TrackListProps {
  onPlay?: (track: Track) => void;
  onLike?: (trackId: string) => void;
  onComment?: (trackId: string) => void;
  onShare?: (trackId: string) => void;
  currentTrack?: Track | null;
  isPlaying?: boolean;
}

export function TrackList({
  onPlay,
  onLike,
  onComment,
  onShare,
  currentTrack,
  isPlaying,
}: TrackListProps) {
  const params = useParams();
  const profileIdentifier = params.identifier as string;

  // Get user data to get the address
  const { data: userResponse } = useUser(profileIdentifier);
  const userData = userResponse?.data;

  // Get user's track IDs
  const { data: userTracksResponse, isLoading: isLoadingUserTracks } = useUserTracks(
    userData?.address || "",
  );
  const userTrackIds = userTracksResponse?.data?.tracks || [];

  // Get all tracks to filter by user's tracks - using correct TracksParams
  const { data: allTracksResponse, isLoading: isLoadingAllTracks } = useTracks({
    tab: "latest",
    limit: 50, // Get more tracks to filter from
  });
  const allTracks = allTracksResponse?.data?.tracks || [];

  // Filter tracks to only show user's tracks - already in Story Protocol format
  const userTracks = allTracks.filter((track) => userTrackIds.includes(track.id));

  const isLoading = isLoadingUserTracks || isLoadingAllTracks;

  // Social actions hooks
  const likeTrackMutation = useLikeTrack();
  const addCommentMutation = useAddComment();

  // Use parent handlers if provided, otherwise use local handlers
  const handlePlay =
    onPlay ||
    ((track: any) => {
      console.log("Playing track:", track);
    });

  const handleLike =
    onLike ||
    ((trackId: string) => {
      const track = userTracks.find((t) => t.id === trackId);
      likeTrackMutation.mutate(
        { trackId, trackTitle: track?.title },
        {
          onError: (error) => {
            toast.error("Failed to like track");
            console.error("Like error:", error);
          },
        },
      );
    });

  const handleComment =
    onComment ||
    ((trackId: string) => {
      const comment = prompt("Add a comment:");
      if (comment) {
        addCommentMutation.mutate(
          { trackId, content: comment },
          {
            onError: (error) => {
              toast.error("Failed to add comment");
              console.error("Comment error:", error);
            },
          },
        );
      }
    });

  const handleShare =
    onShare ||
    ((trackId: string) => {
      const url = `${window.location.origin}/track/${trackId}`;
      navigator.clipboard.writeText(url).then(() => {
        toast.success("Track link copied to clipboard!");
      });
    });

  if (isLoading) {
    return (
      <div className="space-y-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="animate-pulse p-4">
            <div className="flex items-center gap-4">
              <div className="h-4 w-6 rounded bg-muted" />
              <div className="h-12 w-12 rounded-md bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded bg-muted" />
                <div className="h-3 w-1/2 rounded bg-muted" />
              </div>
              <div className="flex gap-2">
                <div className="h-8 w-8 rounded bg-muted" />
                <div className="h-8 w-8 rounded bg-muted" />
                <div className="h-8 w-8 rounded bg-muted" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {userTracks.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-6 text-center">
          <h3 className="mb-3 font-bold text-xl">No sounds published yet</h3>
          <p className="text-muted-foreground">Your registered sounds will appear here</p>
        </div>
      ) : (
        <div className="space-y-1">
          {userTracks.map((track, index) => (
            <TrackCard
              key={track.id}
              track={track}
              onPlay={handlePlay}
              onLike={handleLike}
              onComment={handleComment}
              onShare={handleShare}
              isPlaying={currentTrack?.id === track.id && isPlaying}
              showArtist={false}
              variant="list"
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );
}
