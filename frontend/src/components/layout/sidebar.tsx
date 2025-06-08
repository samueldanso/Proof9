"use client";

import { ConnectButton } from "@/components/auth/connect";
import IconHome from "@/components/icons/home.svg";
import IconHomeFill from "@/components/icons/homeFill.svg";
import IconProfile from "@/components/icons/person.svg";
import IconProfileFill from "@/components/icons/personFill.svg";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { useAccount } from "wagmi";
import { Logo } from "./logo";

export function Sidebar() {
  const pathname = usePathname();
  const { address, isConnected } = useAccount();

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
      href: `/profile/${address}`,
      label: "Profile",
      icon: IconProfile,
      iconFill: IconProfileFill,
    },
  ];

  return (
    <div className="flex h-full w-full flex-col py-8">
      {/* Logo at top */}
      <div className="mb-12 px-6">
        <Logo variant="sidebar" />
      </div>

      {/* Navigation Links - Centered */}
      <nav className="flex flex-1 items-center justify-center px-4">
        {isConnected && address ? (
          <div className="space-y-3 w-full">
            {navLinks.map((link) => {
              const IconComponent =
                pathname === link.href ? link.iconFill : link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-3 py-3 font-medium transition-colors ${
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <IconComponent className="h-5 w-5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center text-center px-4">
            <p className="text-muted-foreground text-sm">
              Connect your wallet to access features
            </p>
          </div>
        )}
      </nav>

      {/* Bottom section: Wallet + Theme */}
      <div className="space-y-3 px-4">
        {/* Wallet Connection - Modern sidebar placement */}
        <ConnectButton variant="sidebar" label="Connect Wallet" />

        {/* Theme toggle */}
        <ThemeToggle />
      </div>
    </div>
  );
}
