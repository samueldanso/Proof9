"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import IconChat from "@/components/icons/bubble.svg";
import IconChatFill from "@/components/icons/bubble.svg";
import IconProfile from "@/components/icons/person.svg";
import IconProfileFill from "@/components/icons/personFill.svg";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export function Sidebar() {
  const pathname = usePathname();

  const navLinks = [
    {
      href: "/chat",
      label: "Chat",
      icon: IconChat,
      iconFill: IconChatFill,
    },
    {
      href: "/profile",
      label: "Profile",
      icon: IconProfile,
      iconFill: IconProfileFill,
    },
  ];

  return (
    <div className="fixed top-0 left-0 z-30 hidden h-screen w-22 flex-none flex-col items-center bg-background py-4 shadow-[inset_-1px_0px_0px_0px_var(--border)] md:flex dark:bg-gray-900">
      <div className="mb-6 flex flex-col items-center">
        <Image src="/logo.svg" height={40} width={40} alt="logo" />
      </div>
      <div className="flex w-full flex-1 flex-col items-center gap-2">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          const IconComponent = isActive ? link.iconFill : link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex w-16 flex-col items-center gap-1 rounded-xl px-0 py-3 transition-colors ${
                isActive
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                  : "text-muted-foreground hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-300"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <span className="flex items-center justify-center text-[22px]">
                {IconComponent && <IconComponent />}
              </span>
              <span className="font-medium text-xs leading-tight">{link.label}</span>
            </Link>
          );
        })}
      </div>
      <div className="mt-auto mb-2">
        <ThemeToggle />
      </div>
    </div>
  );
}
