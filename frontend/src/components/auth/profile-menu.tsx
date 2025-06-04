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
import { useTomoAuth } from "@/lib/tomo/use-tomo-auth";
import { cn } from "@/lib/utils";
import {
  BookmarkSimple,
  Moon as MoonIcon,
  SignOut,
  Sun as SunIcon,
  User,
} from "@phosphor-icons/react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAccount } from "wagmi";

interface ProfileMenuProps {
  className?: string;
}

export function ProfileMenu({ className }: ProfileMenuProps) {
  const { user, disconnect, isLoading } = useTomoAuth();
  const { address } = useAccount();
  const router = useRouter();
  const { setTheme, resolvedTheme: theme } = useTheme();

  const handleLogout = async () => {
    if (!user || isLoading) return;

    try {
      disconnect();
      toast.success("Successfully logged out");
      router.push("/");
    } catch (error) {
      console.error("Failed to logout:", error);
      toast.error("Failed to log out");
    }
  };

  const handleProfileClick = () => {
    if (address) {
      // Use short address for profile URL
      const shortAddress = address.substring(0, 8);
      router.push(`/u/${shortAddress}`);
    }
  };

  if (!user || !address) return null;

  // Get the first few characters of the address for display
  const displayAddress = address.substring(0, 2).toUpperCase();

  return (
    <div className={cn(className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{displayAddress}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <div className="mb-1 px-2 py-1.5">
            <p className="font-semibold text-muted-foreground text-xs">
              {address.slice(0, 6)}...{address.slice(-4)}
            </p>
          </div>
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
          <DropdownMenuItem onClick={handleLogout} disabled={isLoading}>
            <SignOut className="mr-2 size-5" weight="bold" />
            <span className="text-base">{isLoading ? "Logging out..." : "Logout"}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
