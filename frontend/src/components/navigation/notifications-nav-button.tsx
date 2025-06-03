"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bell } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NotificationsNavButtonProps {
  className?: string;
}

export function NotificationsNavButton({ className }: NotificationsNavButtonProps) {
  const pathname = usePathname();
  const isActive = pathname.startsWith("/notifications");

  // Static UI without actual notifications functionality
  const unreadCount = 0;

  return (
    <div className={cn(className)}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn("relative", isActive && "bg-accent text-accent-foreground")}
        asChild
      >
        <Link href="/notifications">
          <Bell className="size-5" weight="bold" />
          {unreadCount > 0 && (
            <Badge
              className="-right-1 -top-1 absolute flex size-4 items-center justify-center rounded-full bg-[#00A8FF] p-0 text-white"
              variant="outline"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Link>
      </Button>
    </div>
  );
}
