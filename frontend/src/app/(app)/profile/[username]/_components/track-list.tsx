"use client";

import { TrackCard } from "@/components/shared/track-card";

// Mock track data for demo
const mockTracks = [
  {
    id: "1",
    title: "Summer Vibes",
    artist: "0xE89f...2455",
    artistAddress: "0xE89fEf221bdEd027C4c9F07D256b9Dc1422A2455",
    duration: "3:24",
    plays: 1250,
    verified: true,
    likes: 89,
    comments: 12,
    isLiked: false,
    imageUrl: "",
  },
  {
    id: "2",
    title: "Midnight Dreams",
    artist: "0xE89f...2455",
    artistAddress: "0xE89fEf221bdEd027C4c9F07D256b9Dc1422A2455",
    duration: "4:12",
    plays: 892,
    verified: true,
    likes: 64,
    comments: 8,
    isLiked: true,
    imageUrl: "",
  },
  {
    id: "3",
    title: "Urban Flow",
    artist: "0xE89f...2455",
    artistAddress: "0xE89fEf221bdEd027C4c9F07D256b9Dc1422A2455",
    duration: "2:56",
    plays: 2134,
    verified: false,
    likes: 143,
    comments: 23,
    isLiked: false,
    imageUrl: "",
  },
];

export function TrackList() {
  const handlePlay = (track: any) => {
    console.log("Playing track:", track);
    // Handle play logic - this would integrate with the music player
  };

  const handleLike = (trackId: string) => {
    console.log("Liking track:", trackId);
    // Handle like logic
  };

  const handleComment = (trackId: string) => {
    console.log("Commenting on track:", trackId);
    // Handle comment logic
  };

  const handleShare = (trackId: string) => {
    console.log("Sharing track:", trackId);
    // Handle share logic
  };

  return (
    <div className="space-y-6">
      {mockTracks.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-6 text-center">
          <h3 className="mb-3 font-bold text-xl">No sounds published yet</h3>
          <p className="text-muted-foreground">
            Your registered sounds will appear here
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-1">
          {mockTracks.map((track) => (
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
