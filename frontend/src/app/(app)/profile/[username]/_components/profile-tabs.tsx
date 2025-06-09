"use client";

import { useState } from "react";
import { TrackList } from "./track-list";

interface ProfileTabsProps {
  defaultTab?: "tracks" | "likes";
}

export function ProfileTabs({ defaultTab = "tracks" }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<"tracks" | "likes">(defaultTab);

  return (
    <div className="flex w-full flex-col gap-4">
      {/* Tab Headers - Rounded pill design with softer colors */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${
            activeTab === "tracks"
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:bg-accent/30 hover:text-foreground"
          }`}
          onClick={() => setActiveTab("tracks")}
        >
          Sounds
        </button>
        <button
          type="button"
          className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${
            activeTab === "likes"
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:bg-accent/30 hover:text-foreground"
          }`}
          onClick={() => setActiveTab("likes")}
        >
          Likes
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "tracks" ? (
        <TrackList />
      ) : (
        <div className="flex flex-col items-center justify-center p-6 text-center">
          <h3 className="mb-3 font-bold text-xl">No liked sounds yet</h3>
          <p className="text-muted-foreground">
            Sounds you like will appear here
          </p>
        </div>
      )}
    </div>
  );
}
