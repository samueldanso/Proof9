"use client";

import { TrackActions } from "@/components/shared/track-actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useParams } from "next/navigation";
import { useState } from "react";
import LicenseInfo from "./_components/license-info";
import TrackHeader from "./_components/track-header";
import TrackMedia from "./_components/trackmedia";

// Mock track data - in real app this would come from API
const mockTrack = {
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
  description:
    "A chill summer track perfect for relaxing by the beach. Created with love and passion for music.",
  genre: "Chill/Electronic",
  bpm: 120,
  key: "C Major",
  createdAt: "2024-01-15",
  license: {
    type: "Commercial",
    price: "0.05 ETH",
    available: true,
    terms: "Full commercial use, attribution required",
    downloads: 45,
  },
};

export default function TrackPage() {
  const params = useParams();
  const trackId = params.id as string;
  const [track] = useState(mockTrack);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleLike = () => {
    // Handle like logic
  };

  const handleComment = () => {
    // Handle comment logic
  };

  const handleShare = () => {
    // Handle share logic
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-6">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Left Side - Track Details */}
        <div className="space-y-6">
          {/* Track Header */}
          <TrackHeader track={track} />

          {/* Track Media */}
          <TrackMedia track={track} isPlaying={isPlaying} onPlay={handlePlay} />

          {/* Track Info */}
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <h2 className="font-semibold text-lg">About this track</h2>
                <p className="mt-2 text-muted-foreground">{track.description}</p>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Genre:</span>
                  <p className="text-muted-foreground">{track.genre}</p>
                </div>
                <div>
                  <span className="font-medium">BPM:</span>
                  <p className="text-muted-foreground">{track.bpm}</p>
                </div>
                <div>
                  <span className="font-medium">Key:</span>
                  <p className="text-muted-foreground">{track.key}</p>
                </div>
                <div>
                  <span className="font-medium">Created:</span>
                  <p className="text-muted-foreground">{track.createdAt}</p>
                </div>
              </div>

              <Separator />

              {/* Track Actions */}
              <TrackActions
                trackId={track.id}
                likes={track.likes}
                comments={track.comments}
                isLiked={track.isLiked}
                onLike={handleLike}
                onComment={handleComment}
                onShare={handleShare}
              />
            </div>
          </Card>
        </div>

        {/* Right Side - Licensing Info */}
        <div className="space-y-6">
          <LicenseInfo track={track} />

          {/* Additional licensing details */}
          <Card className="p-6">
            <h3 className="mb-4 font-semibold text-lg">License Details</h3>
            <div className="space-y-4">
              <div>
                <span className="font-medium">License Type:</span>
                <p className="text-muted-foreground">{track.license.type}</p>
              </div>
              <div>
                <span className="font-medium">Terms:</span>
                <p className="text-muted-foreground">{track.license.terms}</p>
              </div>
              <div>
                <span className="font-medium">Downloads:</span>
                <p className="text-muted-foreground">{track.license.downloads} purchases</p>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xl">{track.license.price}</span>
                  <span className="text-muted-foreground text-sm">
                    ${(0.05 * 3000).toFixed(0)} USD
                  </span>
                </div>

                <Button className="w-full" size="lg">
                  Purchase License
                </Button>

                <Button variant="outline" className="w-full" size="lg">
                  Preview Download
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
