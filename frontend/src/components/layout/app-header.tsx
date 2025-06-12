"use client";

import { SearchBar } from "@/components/shared/search-bar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUser } from "@/lib/api/hooks";
import { getAvatarUrl } from "@/lib/avatar";
import { useAccountModal, useConnectModal } from "@tomo-inc/tomo-evm-kit";
import { Menu, Plus, Search, X } from "lucide-react";
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

            {/* Right: Upload, Search, Menu */}
            <div className="flex items-center gap-2">
              <UploadButton />
              <Button variant="ghost" size="sm" onClick={() => setIsSearchExpanded(true)}>
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
            <Button variant="ghost" size="sm" onClick={() => setIsSearchExpanded(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        )}
      </header>
    );
  }

  return (
    <header className="flex h-16 w-full items-center justify-between bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Empty space for balance */}
      <div />

      {/* Search Bar - Centered */}
      <div className="-translate-x-1/2 absolute left-1/2 transform">
        <SearchBar />
      </div>

      {/* Right: Upload Button & Profile Avatar */}
      <div className="flex items-center gap-3">
        <UploadButton />
        <UserProfileAvatar />
      </div>
    </header>
  );
}
