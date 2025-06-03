"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface RevenueShareProps {
  postId?: string;
  revenueShare?: number;
  totalRevenue?: number;
  currency?: string;
  className?: string;
}

export function RevenueShare({
  postId,
  revenueShare = 10,
  totalRevenue = 0,
  currency = "WGHO",
  className,
}: RevenueShareProps) {
  return (
    <Card className={cn("border-muted", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="font-medium text-lg">Revenue Sharing</CardTitle>
          <Badge variant="outline" className="px-2 py-0 text-xs">
            Coming Soon
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <Sparkles className="mb-2 size-10 text-amber-500/70" />
          <h3 className="font-medium">Automatic Revenue Distribution</h3>
          <p className="mt-1 mb-4 text-muted-foreground text-sm">
            Supporters will receive {revenueShare}% of revenue automatically shared based on their
            collection amount.
          </p>

          <div className="my-4 grid w-full grid-cols-2 gap-4 text-center">
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-muted-foreground text-xs">Creator Share</p>
              <p className="font-medium text-lg">{100 - revenueShare}%</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-muted-foreground text-xs">Supporter Share</p>
              <p className="font-medium text-lg">{revenueShare}%</p>
            </div>
          </div>

          <Button disabled className="mt-2 opacity-70">
            View Distribution Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
