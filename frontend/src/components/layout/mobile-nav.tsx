"use client";

import { useTomoAuth } from "@/lib/tomo/use-tomo-auth";
import { cn } from "@/lib/utils";
import { Bell, BookmarkSimple, House, Sparkle, Users } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function MobileNav() {
  const pathname = usePathname();
  const { user, isConnected } = useTomoAuth();
  const isAuthenticated = isConnected && !!user;

  // Don't show navigation on landing page
  if (pathname === "/") {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 z-10 w-full border-border border-t bg-background md:hidden">
      <nav className="grid h-16 grid-cols-5 items-center">
        <Link
          href="/feed"
          className={cn(
            "flex flex-col items-center justify-center text-center transition-colors",
            pathname.startsWith("/feed") ? "text-[#00A8FF]" : "text-muted-foreground",
          )}
        >
          <House className="mb-0.5 size-6" weight="bold" />
          <span className="font-medium text-xs">Home</span>
        </Link>

        <Link
          href="/groups"
          className={cn(
            "flex flex-col items-center justify-center text-center transition-colors",
            pathname.startsWith("/groups") ? "text-[#00A8FF]" : "text-muted-foreground",
          )}
        >
          <Users className="mb-0.5 size-6" weight="bold" />
          <span className="font-medium text-xs">Believers</span>
        </Link>

        <Link
          href="/posts/create"
          className="flex flex-col items-center justify-center text-center"
        >
          <div className="flex size-10 items-center justify-center rounded-full bg-[#00A8FF] text-white">
            <Sparkle className="size-6" weight="bold" />
          </div>
          <span className="font-medium text-xs">Campaign</span>
        </Link>

        <Link
          href="/notifications"
          className={cn(
            "flex flex-col items-center justify-center text-center transition-colors",
            pathname.startsWith("/notifications") ? "text-[#00A8FF]" : "text-muted-foreground",
          )}
        >
          <Bell className="mb-0.5 size-6" weight="bold" />
          <span className="font-medium text-xs">Notifications</span>
        </Link>

        <Link
          href="/bookmarks"
          className={cn(
            "flex flex-col items-center justify-center text-center transition-colors",
            pathname.startsWith("/bookmarks") ? "text-[#00A8FF]" : "text-muted-foreground",
          )}
        >
          <BookmarkSimple className="mb-0.5 size-6" weight="bold" />
          <span className="font-medium text-xs">Saved</span>
        </Link>
      </nav>
    </div>
  );
}
