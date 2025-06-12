"use client";

import { SearchBar } from "@/components/shared/search-bar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUser } from "@/lib/api/hooks";
import { getAvatarUrl } from "@/lib/avatar";
import { useAccountModal, useConnectModal } from "@tomo-inc/tomo-evm-kit";
import { Bell, Menu, Plus, Search, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useAccount } from "wagmi";
import { Sidebar } from "./sidebar";

// Upload Button Component
function UploadButton() {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return null;
  }

  return (
    <Link href="/upload">
      <Button
        variant="default"
        size="sm"
        className="flex items-center gap-2 bg-[#ced925] font-medium text-black hover:bg-[#b8c220]"
      >
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">Upload</span>
      </Button>
    </Link>
  );
}

// Notifications Button Component
function NotificationsButton() {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return null;
  }

  // For now, just show coming soon - no real functionality yet
  const handleNotificationClick = () => {
    // TODO: Implement notifications feature
    alert(
      "🔔 Notifications coming soon!\n\nYou'll get notified about:\n• New license purchases\n• Revenue claims\n• Comments & likes\n• Followers"
    );
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleNotificationClick}
      className="relative"
    >
      <Bell className="h-5 w-5" />
      {/* Notification badge - hidden for now */}
      {/* <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
        3
      </span> */}
    </Button>
  );
}

// User Profile Avatar Component
function UserProfileAvatar() {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { openAccountModal } = useAccountModal();

  // Get user profile data
  const { data: userResponse } = useUser(address || "");
  const userData = userResponse?.data;

  // For disconnected users - show connect button
  if (!isConnected || !address) {
    return (
      <Button
        onClick={openConnectModal}
        className="bg-[#ced925] text-black hover:bg-[#b8c220]"
        variant="default"
      >
        Log in
      </Button>
    );
  }

  // For connected users - show profile avatar
  return (
    <button
      onClick={openAccountModal}
      className="flex items-center gap-2 rounded-full p-1 transition-opacity hover:opacity-80"
      type="button"
    >
      <img
        src={getAvatarUrl(userData?.avatar_url)}
        alt="Profile"
        className="h-8 w-8 rounded-full bg-muted object-cover"
      />
    </button>
  );
}

export function AppHeader() {
  const isMobile = useIsMobile();
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  if (isMobile) {
    return (
      <header className="flex h-16 w-full items-center justify-between bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {!isSearchExpanded ? (
          <>
            {/* Left: User Profile Avatar on Mobile */}
            <UserProfileAvatar />

            {/* Right: Upload, Notifications, Search, Menu */}
            <div className="flex items-center gap-2">
              <UploadButton />
              <NotificationsButton />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSearchExpanded(true)}
              >
                <Search className="h-5 w-5" />
              </Button>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                  <div className="flex h-full flex-col">
                    <Sidebar />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </>
        ) : (
          <div className="flex w-full items-center gap-3">
            <div className="flex-1">
              <SearchBar />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSearchExpanded(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        )}
      </header>
    );
  }

  return (
    <header className="flex h-16 w-full items-center bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Left: Empty space for balance */}
      <div className="w-32" />

      {/* Center: Search Bar - Properly sized */}
      <div className="flex-1 mx-6 max-w-2xl">
        <SearchBar />
      </div>

      {/* Right: Upload, Notifications & Profile Avatar */}
      <div className="flex w-32 items-center justify-end gap-3">
        <UploadButton />
        <NotificationsButton />
        <UserProfileAvatar />
      </div>
    </header>
  );
}
