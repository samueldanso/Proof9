"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTomoAuth } from "@/lib/tomo/use-tomo-auth";
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
    tabParam === "verified" || tabParam === "trending" ? tabParam : "following",
  );

  return (
    <div className="w-full px-4 pb-12 md:px-6">
      {/* Top section with tabs and trending */}
      <div className="flex flex-col gap-6 md:flex-row">
        <div className="flex-1">
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
              <div className="border-b">
                <TabsList className="mb-0 h-12 w-full rounded-none bg-transparent p-0">
                  <TabsTrigger
                    value="following"
                    className="h-12 flex-1 rounded-none border-transparent border-b-2 bg-transparent px-6 data-[state=active]:border-[#00A8FF] data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                  >
                    Following
                  </TabsTrigger>
                  <TabsTrigger
                    value="verified"
                    className="h-12 flex-1 rounded-none border-transparent border-b-2 bg-transparent px-6 data-[state=active]:border-[#00A8FF] data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                  >
                    Verified
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="trending" className="mt-4">
                <PlaceholderFeed />
              </TabsContent>

              <TabsContent value="trending" className="mt-4">
                <PlaceholderFeed />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
