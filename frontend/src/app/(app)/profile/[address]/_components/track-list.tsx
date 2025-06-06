"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MoreHorizontal, Play } from "lucide-react";

// Mock track data for demo
const mockTracks = [
  {
    id: "1",
    title: "Summer Vibes",
    duration: "3:24",
    plays: 1250,
    verified: true,
  },
  {
    id: "2",
    title: "Midnight Dreams",
    duration: "4:12",
    plays: 892,
    verified: true,
  },
  {
    id: "3",
    title: "Urban Flow",
    duration: "2:56",
    plays: 2134,
    verified: false,
  },
];

export function TrackList() {
  return (
    <div className="space-y-3">
      {mockTracks.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-6 text-center">
          <h3 className="mb-3 font-bold text-xl">No tracks published yet</h3>
          <p className="text-muted-foreground">Your uploaded tracks will appear here</p>
        </div>
      ) : (
        mockTracks.map((track) => (
          <Card key={track.id} className="cursor-pointer p-4 transition-colors hover:bg-accent/50">
            <div className="flex items-center gap-4">
              {/* Play Button */}
              <Button
                size="sm"
                variant="ghost"
                className="h-10 w-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Play className="h-4 w-4 fill-current" />
              </Button>

              {/* Track Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{track.title}</h4>
                  {track.verified && (
                    <div className="h-2 w-2 rounded-full bg-green-500" title="Verified" />
                  )}
                </div>
                <div className="flex items-center gap-4 text-muted-foreground text-sm">
                  <span>{track.duration}</span>
                  <span>{track.plays.toLocaleString()} plays</span>
                </div>
              </div>

              {/* More Options */}
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
