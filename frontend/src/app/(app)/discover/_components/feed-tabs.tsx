"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

type FeedTab = "following" | "trending" | "recent";

interface FeedTabsProps {
  defaultTab?: FeedTab;
}

export function FeedTabs({ defaultTab = "following" }: FeedTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentTab = (searchParams.get("tab") as FeedTab) || defaultTab;

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams],
  );

  const handleTabChange = (value: string) => {
    router.push(`${pathname}?${createQueryString("tab", value)}`);
  };

  return (
    <div className="mb-6">
      <Tabs
        defaultValue={currentTab}
        value={currentTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="w-full max-w-md">
          <TabsTrigger className="flex-1" value="following">
            Following
          </TabsTrigger>
          <TabsTrigger className="flex-1" value="trending">
            Trending
          </TabsTrigger>
          <TabsTrigger className="flex-1" value="recent">
            Recent
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
