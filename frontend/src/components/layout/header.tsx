"use client";

import { Login } from "@/components/auth/login";
import { ProfileMenu } from "@/components/auth/profile-menu";
import { Logo } from "@/components/layout/logo";
import { SearchBar } from "@/components/shared/search-bar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthenticatedUser } from "@lens-protocol/react";
import {
  Bell,
  ChartLineUp,
  House,
  Sparkle,
  Users as UsersIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function Header() {
  const pathname = usePathname();
  const { data: user } = useAuthenticatedUser();

  // Handle cross-tab authentication changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.includes("lens.auth")) {
        window.location.reload();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Simple conditional rendering based on auth state
  return user ? (
    <header
      className={cn(
        "fixed top-0 left-0 z-10 w-full bg-background/95 py-3 backdrop-blur-sm",
        pathname !== "/" && "border-border/40 border-b"
      )}
    >
      <div className="container mx-auto flex max-w-6xl items-center px-4 md:px-6">
        <div className="flex items-center">
          <Logo className="mr-6 size-9 flex-shrink-0" variant="icon" />

          {/* Desktop navigation links */}
          <div className="hidden items-center gap-1 md:flex">
            <Link
              href="/feed"
              className={cn(
                "flex flex-col items-center justify-center px-3 text-primary/80 transition-colors hover:text-[#00A8FF]",
                pathname.startsWith("/feed") && "text-[#00A8FF]"
              )}
            >
              <House className="mb-0.5 size-6" weight="bold" />
              <span className="font-semibold text-xs">Home</span>
            </Link>

            <Link
              href="/groups"
              className={cn(
                "flex flex-col items-center justify-center px-3 text-primary/80 transition-colors hover:text-[#00A8FF]",
                pathname.startsWith("/groups") && "text-[#00A8FF]"
              )}
            >
              <UsersIcon className="mb-0.5 size-6" weight="bold" />
              <span className="font-semibold text-xs">Believers</span>
            </Link>

            <Link
              href="/notifications"
              className={cn(
                "flex flex-col items-center justify-center px-3 text-primary/80 transition-colors hover:text-[#00A8FF]",
                pathname.startsWith("/notifications") && "text-[#00A8FF]"
              )}
            >
              <Bell className="mb-0.5 size-6" weight="bold" />
              <span className="font-semibold text-xs">Notifications</span>
            </Link>

            <Link
              href="/dashboard"
              className={cn(
                "flex flex-col items-center justify-center px-3 text-primary/80 transition-colors hover:text-[#00A8FF]",
                pathname.startsWith("/dashboard") && "text-[#00A8FF]"
              )}
            >
              <ChartLineUp className="mb-0.5 size-6" weight="bold" />
              <span className="font-semibold text-xs">Dashboard</span>
            </Link>
          </div>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-3">
          {/* Mobile search - centered */}
          <div className="mx-auto flex w-full max-w-[200px] justify-center md:hidden">
            <SearchBar />
          </div>

          {/* Desktop search */}
          <div className="hidden md:block md:w-[280px]">
            <SearchBar />
          </div>

          {/* Create Campaign button */}
          <Button
            asChild
            className="hidden bg-gradient-to-r from-[#00A8FF] to-[#2D8CFF] font-medium text-sm text-white hover:from-[#00A8FF]/90 hover:to-[#2D8CFF]/90 md:inline-flex"
            size="sm"
          >
            <Link href="/posts/create">
              <Sparkle className="mr-1.5 size-5" weight="bold" />
              Create Campaign
            </Link>
          </Button>

          <ProfileMenu />
        </div>
      </div>
    </header>
  ) : (
    <header
      className={cn(
        "fixed top-0 left-0 z-10 w-full bg-background/95 py-3 backdrop-blur-sm",
        pathname !== "/" && "border-border/40 border-b"
      )}
    >
      <div className="container mx-auto flex max-w-6xl items-center justify-between px-4 md:px-6">
        <Logo className="mr-6" variant="full" />
        <Login variant="header" label="Sign in" />
      </div>
    </header>
  );
}
