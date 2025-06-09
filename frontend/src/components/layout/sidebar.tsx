"use client";

import IconHome from "@/components/icons/home.svg";
import IconHomeFill from "@/components/icons/homeFill.svg";
import IconProfile from "@/components/icons/person.svg";
import IconProfileFill from "@/components/icons/personFill.svg";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { useUser } from "@/lib/api/hooks";
import { Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { useAccount } from "wagmi";
import { Logo } from "./logo";

export function Sidebar() {
  const pathname = usePathname();
  const { address, isConnected } = useAccount();

  // Get user data to determine profile URL
  const { data: userResponse } = useUser(address || "");
  const userData = userResponse?.data;

  // Use username if available, fallback to address
  const profileIdentifier = userData?.username || address;

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
      href: `/profile/${profileIdentifier}`,
      label: "Profile",
      icon: IconProfile,
      iconFill: IconProfileFill,
    },
  ];

  return (
    <div className="flex h-full w-full flex-col py-2">
      {/* Logo at top - aligned with header */}
      <div className="flex h-16 items-center px-6">
        <Logo variant="sidebar" />
      </div>

      {/* Navigation Links - Centered */}
      <nav className="flex flex-1 items-center justify-center px-4">
        {isConnected && address ? (
          <div className="w-full space-y-3">
            {navLinks.map((link) => {
              const IconComponent = pathname === link.href ? link.iconFill : link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-3 font-medium transition-colors ${
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  }`}
                >
                  <IconComponent className="h-5 w-5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center px-4 text-center">
            <p className="text-muted-foreground text-sm">Connect your wallet to access features</p>
          </div>
        )}
      </nav>

      {/* Bottom section: Theme Toggle */}
      <div className="px-4">
        <ThemeToggle />
      </div>
    </div>
  );
}
