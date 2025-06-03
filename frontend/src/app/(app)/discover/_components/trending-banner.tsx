"use client";

import { FollowButton } from "@/components/shared/follow-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowUpRight, TrendUp } from "@phosphor-icons/react";
import Link from "next/link";

export interface Creator {
  id: string;
  name: string;
  username: string;
  picture: string;
  stats: {
    followers: number;
    collects: number;
  };
}

export interface Campaign {
  id: string;
  title: string;
  creator: {
    id: string;
    name: string;
    username: string;
    picture: string;
  };
  collectible: {
    price: string;
    currency: string;
    collected: number;
    total: number;
  };
}

interface TrendingBannerProps {
  creators: Creator[];
  campaigns: Campaign[];
}

export function TrendingBanner({ creators, campaigns }: TrendingBannerProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-base">
            <TrendUp className="mr-2 size-4" weight="bold" />
            Featured Campaigns
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-4">
          <div className="space-y-4">
            {campaigns.length === 0 ? (
              <div className="py-2 text-center text-muted-foreground text-sm">
                No trending campaigns to display
              </div>
            ) : (
              campaigns.map((campaign) => (
                <Link
                  key={campaign.id}
                  href={`/posts/${campaign.id}`}
                  className="group block cursor-pointer pt-1"
                >
                  <div className="flex items-center gap-2 pb-1">
                    <Avatar className="size-6 border">
                      <AvatarImage
                        src={campaign.creator.picture}
                        alt={campaign.creator.name}
                      />
                      <AvatarFallback>
                        {campaign.creator.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-[14px] text-muted-foreground">
                      @{campaign.creator.username}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <h3 className="truncate font-medium text-sm group-hover:text-primary">
                      {campaign.title}
                    </h3>
                    <ArrowUpRight
                      className="ml-2 hidden size-3 group-hover:inline"
                      weight="bold"
                    />
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <div className="text-muted-foreground text-xs">
                      <span className="font-medium text-foreground">
                        {campaign.collectible.collected}
                      </span>{" "}
                      of{" "}
                      <span
                        className={cn(
                          "font-medium",
                          campaign.collectible.collected >=
                            campaign.collectible.total
                            ? "text-green-500 dark:text-green-400"
                            : "text-foreground"
                        )}
                      >
                        {campaign.collectible.total}
                      </span>{" "}
                      collected
                    </div>
                    <div className="font-medium text-xs">
                      {campaign.collectible.price}{" "}
                      {campaign.collectible.currency}
                    </div>
                  </div>
                  <div className="mt-2 h-1.5 w-full rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-1.5 rounded-full",
                        campaign.collectible.collected >=
                          campaign.collectible.total
                          ? "bg-green-500"
                          : "bg-primary"
                      )}
                      style={{
                        width: `${Math.min(
                          100,
                          (campaign.collectible.collected /
                            campaign.collectible.total) *
                            100
                        )}%`,
                      }}
                    />
                  </div>
                </Link>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-base">
            <TrendUp className="mr-2 size-4" weight="bold" />
            Discover Creators
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-4">
          <div className="space-y-4">
            {creators.length === 0 ? (
              <div className="py-2 text-center text-muted-foreground text-sm">
                No trending creators to display
              </div>
            ) : (
              creators.map((creator) => (
                <div key={creator.id} className="flex items-center gap-3">
                  <Link
                    href={`/u/${creator.username}`}
                    className="flex flex-1 items-center gap-3"
                  >
                    <Avatar className="size-9 border">
                      <AvatarImage src={creator.picture} alt={creator.name} />
                      <AvatarFallback>{creator.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 truncate">
                      <div className="flex items-center gap-1 truncate">
                        <span className="truncate font-medium">
                          {creator.name}
                        </span>
                      </div>
                      <div className="flex text-muted-foreground">
                        <span className="font-semibold text-[14px]">
                          @{creator.username}
                        </span>
                      </div>
                    </div>
                  </Link>
                  <FollowButton
                    userId={creator.id}
                    username={creator.username}
                    variant="outline"
                    size="sm"
                    showText={true}
                    rounded={true}
                  />
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
