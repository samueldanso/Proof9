"use client";

import { Login } from "@/components/auth/login";
import { useTomoAuth } from "@/lib/tomo/use-tomo-auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

import IconHome from "@/components/icons/home.svg";
import IconHomeFill from "@/components/icons/homeFill.svg";
import IconProfile from "@/components/icons/person.svg";
import IconProfileFill from "@/components/icons/personFill.svg";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bookmark, LogOut, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { Logo } from "./logo";

export function Sidebar() {
  const pathname = usePathname();
  const { user, isConnected, disconnect, isLoading } = useTomoAuth();
  const { address } = useAccount();
  const router = useRouter();

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

  // Get the first few characters of the address for display
  const displayAddress = address ? address.substring(0, 2).toUpperCase() : "";

  const navLinks = [
    {
      href: "/discover",
      label: "Discover",
      icon: IconHome,
      iconFill: IconHomeFill,
    },
    {
      href: "/upload",
      label: "Upload",
      icon: Plus,
      iconFill: Plus,
    },
    {
      href: "/bookmarks",
      label: "Saved",
      icon: Bookmark,
      iconFill: Bookmark,
    },
  ];

  return isConnected && user ? (
    <div className="flex h-full w-full flex-col gap-0.5">
      <Logo className="h-10 w-10" />

      {/* User Profile Section */}
      <div className="mb-4 rounded-[12px] bg-muted/50 p-3">
        <div className="mb-3 flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{displayAddress}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-sm" title={address}>
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
          </div>
        </div>
        <Button
          onClick={handleProfileClick}
          variant="ghost"
          size="sm"
          className="h-8 w-full justify-start gap-2 px-2"
        >
          <IconProfile className="h-4 w-4" />
          <span className="text-sm">View Profile</span>
        </Button>
      </div>

      {/* Navigation Links */}
      {navLinks.map((link) => {
        const IconComponent = pathname === link.href ? link.iconFill : link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 rounded-[12px] px-3 py-3 font-medium leading-[24px] ${
              pathname === link.href
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className={"p-0.5 text-[20px]"}>
              <IconComponent />
            </span>
            <p>{link.label}</p>
          </Link>
        );
      })}

      {/* Bottom Actions */}
      <div className="mt-auto mb-2 space-y-2">
        <ThemeToggle />
        <Button
          onClick={handleLogout}
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive"
          disabled={isLoading}
        >
          <LogOut className="h-4 w-4" />
          <span className="text-sm">{isLoading ? "Logging out..." : "Logout"}</span>
        </Button>
      </div>
    </div>
  ) : (
    <Login variant="sidebar" label="Sign in" />
  );
}
