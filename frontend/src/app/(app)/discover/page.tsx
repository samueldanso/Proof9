"use client";

import { MusicPlayer } from "@/components/shared/music-player";
import { TrackCard } from "@/components/shared/track-card";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import FeedTabs from "./_components/feed-tabs";
import TrendingBanner from "./_components/trending-banner";

// Mock track data for the main feed
const mockFeedTracks = [
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
    artist: "0xA1B2...3456",
    artistAddress: "0xA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0",
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
    artist: "0x123F...7890",
    artistAddress: "0x123F456A789B012C345D678E901F234A567B890C",
    duration: "2:56",
    plays: 2134,
    verified: false,
    likes: 143,
    comments: 23,
    isLiked: false,
    imageUrl: "",
  },
  {
    id: "4",
    title: "Cosmic Journey",
    artist: "0xDEAD...BEEF",
    artistAddress: "0xDEADBEEF123456789ABCDEF0123456789ABCDEF0",
    duration: "5:18",
    plays: 567,
    verified: true,
    likes: 234,
    comments: 45,
    isLiked: false,
    imageUrl: "",
  },
];

// Mock trending tracks for sidebar
const mockTrendingTracks = [
  {
    id: "t1",
    title: "Neon Nights",
    artist: "0xCAFE...BABE",
    artistAddress: "0xCAFEBABE123456789ABCDEF0123456789ABCDEF0",
    duration: "3:45",
    plays: 8234,
    verified: true,
    likes: 456,
    comments: 67,
    isLiked: false,
    imageUrl: "",
  },
  {
    id: "t2",
    title: "Digital Dreams",
    artist: "0x1337...FACE",
    artistAddress: "0x1337FACE123456789ABCDEF0123456789ABCDEF0",
    duration: "4:22",
    plays: 6789,
    verified: true,
    likes: 312,
    comments: 89,
    isLiked: true,
    imageUrl: "",
  },
  {
    id: "t3",
    title: "Bass Drop",
    artist: "0xFEED...CODE",
    artistAddress: "0xFEEDCODE123456789ABCDEF0123456789ABCDEF0",
    duration: "3:12",
    plays: 5432,
    verified: false,
    likes: 234,
    comments: 34,
    isLiked: false,
    imageUrl: "",
  },
];

export default function DiscoverPage() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<string>(
    tabParam === "verified" ||
      tabParam === "trending" ||
      tabParam === "following"
      ? tabParam
      : "following"
  );

  // Music player state
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    window.history.pushState({}, "", url);
  };

  const handlePlay = (track: any) => {
    if (currentTrack?.id === track.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
    }
  };

  const handleLike = (trackId: string) => {
    console.log("Liking track:", trackId);
    // Handle like logic - integrate with API later
  };

  const handleComment = (trackId: string) => {
    console.log("Commenting on track:", trackId);
    // Handle comment logic - integrate with API later
  };

  const handleShare = (trackId: string) => {
    console.log("Sharing track:", trackId);
    // Handle share logic - integrate with API later
  };

  const handlePlayerClose = () => {
    setCurrentTrack(null);
    setIsPlaying(false);
  };

  const getFilteredTracks = () => {
    switch (activeTab) {
      case "verified":
        return mockFeedTracks.filter((track) => track.verified);
      case "trending":
        return [...mockFeedTracks].sort((a, b) => b.plays - a.plays);
      default:
        return mockFeedTracks;
    }
  };

  return (
    <>
      <div className="flex w-full gap-6">
        {/* Main Content Area */}
        <div className="flex-1 space-y-6">
          {/* Feed Tabs */}
          <FeedTabs activeTab={activeTab} onTabChange={handleTabChange} />

          {/* Track Feed */}
          <div className="space-y-6">
            {getFilteredTracks().map((track) => (
              <TrackCard
                key={track.id}
                track={track}
                onPlay={handlePlay}
                onLike={handleLike}
                onComment={handleComment}
                onShare={handleShare}
                isPlaying={currentTrack?.id === track.id && isPlaying}
                showArtist={true}
                variant="feed"
              />
            ))}
          </div>
        </div>

        {/* Right Sidebar - Hidden on mobile */}
        <div className="w-72 space-y-6 hidden lg:block">
          {/* Trending Banner */}
          <TrendingBanner />

          {/* Trending Tracks */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Trending Now</h3>
            <div className="space-y-4">
              {mockTrendingTracks.map((track, index) => (
                <div
                  key={track.id}
                  className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-accent/50"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 font-medium text-primary text-sm">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate font-medium text-sm">
                      {track.title}
                    </h4>
                    <p className="truncate text-muted-foreground text-xs">
                      {track.artist}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground text-xs">
                    <span>{track.plays.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Featured Content Placeholder */}
          <div className="rounded-lg border bg-gradient-to-br from-primary/5 to-primary/10 p-6">
            <h3 className="mb-2 font-semibold text-lg">Featured Artists</h3>
            <p className="mb-4 text-muted-foreground text-sm">
              Discover verified creators making waves on Proof9
            </p>
            <div className="text-center text-muted-foreground text-sm">
              Coming soon...
            </div>
          </div>
        </div>
      </div>

      {/* Music Player */}
      <MusicPlayer
        track={currentTrack}
        isPlaying={isPlaying}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onClose={handlePlayerClose}
      />
    </>
  );
}
