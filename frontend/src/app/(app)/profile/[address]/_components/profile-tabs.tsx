"use client";

import { useState } from "react";
import { TrackList } from "./track-list";

interface ProfileTabsProps {
  defaultTab?: "tracks" | "likes";
}

export function ProfileTabs({ defaultTab = "tracks" }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<"tracks" | "likes">(defaultTab);

  return (
    <div className="mt-3 flex w-full flex-col gap-3">
      {/* Tab Headers - Simple text buttons like Lora */}
      <div className="flex items-center gap-5 font-medium text-muted-foreground">
        <button
          type="button"
          className={`cursor-pointer ${activeTab === "tracks" ? "text-foreground" : ""}`}
          onClick={() => setActiveTab("tracks")}
        >
          Tracks
        </button>
        <button
          type="button"
          className={`cursor-pointer ${activeTab === "likes" ? "text-foreground" : ""}`}
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
          <h3 className="mb-3 font-bold text-xl">No liked tracks yet</h3>
          <p className="text-muted-foreground">Tracks you like will appear here</p>
        </div>
      )}
    </div>
  );
}
