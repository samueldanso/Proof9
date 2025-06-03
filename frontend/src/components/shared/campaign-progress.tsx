"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Clock, Users } from "lucide-react";

interface CampaignProgressProps {
  goalAmount: number;
  currentAmount: number;
  currency?: string;
  collectCount?: number;
  endDate?: string;
  className?: string;
}

export function CampaignProgress({
  goalAmount,
  currentAmount,
  currency = "WGHO",
  collectCount = 0,
  endDate,
  className,
}: CampaignProgressProps) {
  // Calculate progress percentage
  const progress = goalAmount > 0 ? (currentAmount / goalAmount) * 100 : 0;
  const isCompleted = progress >= 100;

  // Format numbers with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString("en-US");
  };

  // Format date to display remaining time
  const getRemainingTime = () => {
    if (!endDate) return "No deadline";

    const endDateTime = new Date(endDate);
    const now = new Date();

    if (endDateTime < now) return "Ended";

    const diffTime = Math.abs(endDateTime.getTime() - now.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays === 1 ? "1 day left" : `${diffDays} days left`;
  };

  return (
    <Card className={cn("border-muted", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="font-medium text-lg">Campaign Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">
                {formatNumber(currentAmount)} {currency} raised
              </span>
              <span className="text-muted-foreground text-sm">
                Goal: {formatNumber(goalAmount)} {currency}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-muted-foreground" />
              <span className="text-sm">
                {collectCount} supporter{collectCount !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center justify-end gap-2">
              <Clock className="size-4 text-muted-foreground" />
              <span className="text-sm">{getRemainingTime()}</span>
            </div>
          </div>

          {/* Status */}
          <div className="pt-2">
            {isCompleted ? (
              <Badge className="bg-green-500">Funded Successfully</Badge>
            ) : (
              <Badge variant="outline">{Math.round(progress)}% Funded</Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
