"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bookmark } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface BookmarksNavButtonProps {
  className?: string;
}

export function BookmarksNavButton({ className }: BookmarksNavButtonProps) {
  const pathname = usePathname();
  const isActive = pathname.startsWith("/bookmarks");

  return (
    <div className={cn(className)}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn("relative", isActive && "bg-accent text-accent-foreground")}
        asChild
      >
        <Link href="/bookmarks">
          <Bookmark className="size-5" weight="bold" />
        </Link>
      </Button>
    </div>
  );
}
