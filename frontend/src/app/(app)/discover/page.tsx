"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

function PlaceholderFeed() {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <h2 className="mb-3 font-bold text-xl">Coming Soon</h2>
      <p className="mb-6 text-muted-foreground">
        The feed functionality is being updated to work with Story Protocol!
      </p>
      <Button variant="outline" onClick={() => window.location.reload()}>
        Check Again
      </Button>
    </div>
  );
}

export default function DiscoverPage() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<string>(
    tabParam === "verified" || tabParam === "trending" || tabParam === "following"
      ? tabParam
      : "following",
  );

  return (
    <div className="w-full">
      <div className="mb-6">
        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            setActiveTab(value);
            const url = new URL(window.location.href);
            url.searchParams.set("tab", value);
            window.history.pushState({}, "", url);
          }}
          className="w-full"
        >
          <TabsList className="mb-0 h-10 w-full rounded-full bg-muted p-1">
            <TabsTrigger
              value="following"
              className="flex-1 rounded-full px-4 py-1.5 font-medium text-sm data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              Following
            </TabsTrigger>
            <TabsTrigger
              value="verified"
              className="flex-1 rounded-full px-4 py-1.5 font-medium text-sm data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              Verified
            </TabsTrigger>
            <TabsTrigger
              value="trending"
              className="flex-1 rounded-full px-4 py-1.5 font-medium text-sm data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              Trending
            </TabsTrigger>
          </TabsList>

          <TabsContent value="following" className="mt-6">
            <PlaceholderFeed />
          </TabsContent>

          <TabsContent value="verified" className="mt-6">
            <PlaceholderFeed />
          </TabsContent>

          <TabsContent value="trending" className="mt-6">
            <PlaceholderFeed />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
