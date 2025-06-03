"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getLensClient } from "@/lib/lens/client";
import { cn } from "@/lib/utils";
import { fetchAccount } from "@lens-protocol/client/actions";
import { useAuthenticatedUser, useLogout } from "@lens-protocol/react";
import {
  BookmarkSimple,
  Moon as MoonIcon,
  SignOut,
  Sun as SunIcon,
  User,
} from "@phosphor-icons/react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ProfileMenuProps {
  className?: string;
}

export function ProfileMenu({ className }: ProfileMenuProps) {
  const { execute: logout, loading: isLoggingOut } = useLogout();
  const { data: user } = useAuthenticatedUser();
  const router = useRouter();
  const [accountData, setAccountData] = useState<any>(null);
  const { setTheme, resolvedTheme: theme } = useTheme();

  useEffect(() => {
    async function fetchUserAccount() {
      if (!user) return;

      try {
        const client = await getLensClient();
        const account = await fetchAccount(client, {
          address: user.address,
        }).unwrapOr(null);
        setAccountData(account);
      } catch (error) {
        console.error("Failed to fetch account:", error);
      }
    }

    fetchUserAccount();
  }, [user]);

  const handleLogout = async () => {
    if (!user || isLoggingOut) return;

    try {
      await logout();

      // Trigger a storage event to notify other tabs
      window.localStorage.setItem("lens.auth.logout", Date.now().toString());

      // Clear any local storage or session data
      localStorage.removeItem("lens.auth.storage");
      sessionStorage.clear();

      toast.success("Successfully logged out");

      // Refresh the page to reset the app state
      router.push("/");

      // We need to force a full page refresh
      window.location.reload();
    } catch (error) {
      console.error("Failed to logout:", error);
      toast.error("Failed to log out");
    }
  };

  const handleProfileClick = () => {
    // Get the username directly from the account data
    const username =
      accountData?.username?.value?.split("/").pop() || accountData?.username?.localName;

    if (username) {
      router.push(`/u/${username}`);
    } else {
      // If we still can't find a username, use the address as fallback
      const shortAddress = user?.address.substring(0, 8);
      router.push(`/u/${shortAddress}`);
    }
  };

  if (!user) return null;

  // Get the first few characters of the address for display
  const displayAddress = user.address.substring(0, 2).toUpperCase();

  // Get profile picture URL - simplify access path and add fallbacks
  let profilePictureUrl = null;

  if (accountData?.metadata?.picture) {
    // Handle direct string URL
    if (typeof accountData.metadata.picture === "string") {
      profilePictureUrl = accountData.metadata.picture;
    }
    // Handle object structure with nested URI
    else if (accountData.metadata.picture?.optimized?.uri) {
      profilePictureUrl = accountData.metadata.picture.optimized.uri;
    } else if (accountData.metadata.picture?.raw?.uri) {
      profilePictureUrl = accountData.metadata.picture.raw.uri;
    }
  }

  // Extract username for display
  const displayName = accountData?.metadata?.name || "";
  const username =
    accountData?.username?.value?.split("/").pop() || accountData?.username?.localName || "";

  return (
    <div className={cn(className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Avatar className="h-8 w-8">
              {profilePictureUrl ? (
                <AvatarImage src={profilePictureUrl} alt="Profile" />
              ) : (
                <AvatarFallback>{displayAddress}</AvatarFallback>
              )}
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          {(displayName || username) && (
            <div className="mb-1 px-2 py-1.5">
              {displayName && <p className="font-medium text-sm">{displayName}</p>}
              {username && (
                <p className="font-semibold text-muted-foreground text-xs">@{username}</p>
              )}
            </div>
          )}
          <DropdownMenuItem onClick={handleProfileClick}>
            <User className="mr-2 size-5" weight="bold" />
            <span className="text-base">Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/bookmarks")}>
            <BookmarkSimple className="mr-2 size-5" weight="bold" />
            <span className="text-base">Saved</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? (
              <SunIcon className="mr-2 size-5" weight="bold" />
            ) : (
              <MoonIcon className="mr-2 size-5" weight="bold" />
            )}
            <span className="text-base">{theme === "dark" ? "Light mode" : "Dark mode"}</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut}>
            <SignOut className="mr-2 size-5" weight="bold" />
            <span className="text-base">{isLoggingOut ? "Logging out..." : "Logout"}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
