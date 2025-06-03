"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Trophy } from "lucide-react";

interface TopSupporter {
  id: string;
  handle: string;
  name?: string;
  imageUrl?: string;
  amount: number;
  currency: string;
  rank: number;
}

interface SupportersListProps {
  postId?: string;
  supporters?: TopSupporter[];
  isLoading?: boolean;
  showComingSoon?: boolean;
  className?: string;
}

export function SupportersList({
  postId,
  supporters = [],
  isLoading = false,
  showComingSoon = true,
  className,
}: SupportersListProps) {
  // Placeholder data for UI demonstration
  const placeholderSupporters: TopSupporter[] = [
    {
      id: "1",
      handle: "user1",
      name: "Early Believer",
      amount: 50,
      currency: "WGHO",
      rank: 1,
    },
    {
      id: "2",
      handle: "user2",
      name: "Top Fan",
      amount: 30,
      currency: "WGHO",
      rank: 2,
    },
    {
      id: "3",
      handle: "user3",
      name: "Supporter",
      amount: 15,
      currency: "WGHO",
      rank: 3,
    },
  ];

  const displaySupporters = supporters.length > 0 ? supporters : placeholderSupporters;

  // Function to render loading skeletons
  const renderSkeletons = () => {
    return Array(3)
      .fill(0)
      .map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1">
            <Skeleton className="mb-1 h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
      ));
  };

  return (
    <Card className={cn("border-muted", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="font-medium text-lg">Top Supporters</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          renderSkeletons()
        ) : showComingSoon ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Trophy className="mb-2 size-10 text-muted-foreground/50" />
            <h3 className="font-medium">Supporter Leaderboard Coming Soon</h3>
            <p className="mt-1 text-muted-foreground text-sm">
              Track your top believers and reward early supporters
            </p>
          </div>
        ) : (
          <div className="space-y-1 divide-y">
            {displaySupporters.map((supporter) => (
              <div key={supporter.id} className="flex items-center gap-3 py-3">
                <div className="relative">
                  <Avatar>
                    <AvatarImage src={supporter.imageUrl} />
                    <AvatarFallback>{supporter.name?.[0] || supporter.handle[0]}</AvatarFallback>
                  </Avatar>
                  {supporter.rank <= 3 && (
                    <span className="-top-1 -right-1 absolute flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                      {supporter.rank}
                    </span>
                  )}
                </div>
                <div className="flex-1 truncate">
                  <p className="truncate font-medium">{supporter.name || supporter.handle}</p>
                  <p className="text-muted-foreground text-xs">@{supporter.handle}</p>
                </div>
                <span className="font-medium text-sm">
                  {supporter.amount} {supporter.currency}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
