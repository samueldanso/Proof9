"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrackList } from "./track-list";

interface ProfileTabsProps {
  defaultTab?: "tracks" | "likes";
}

export function ProfileTabs({ defaultTab = "tracks" }: ProfileTabsProps) {
  return (
    <div className="w-full">
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="mb-6 h-12 w-full max-w-md rounded-full bg-muted p-1">
          <TabsTrigger
            value="tracks"
            className="flex-1 rounded-full px-6 py-2 font-medium text-sm data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
          >
            Tracks
          </TabsTrigger>
          <TabsTrigger
            value="likes"
            className="flex-1 rounded-full px-6 py-2 font-medium text-sm data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
          >
            Likes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tracks" className="mt-6">
          <TrackList />
        </TabsContent>

        <TabsContent value="likes" className="mt-6">
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <h3 className="mb-3 font-bold text-xl">No liked tracks yet</h3>
            <p className="text-muted-foreground">Tracks you like will appear here</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
