"use client";

import { Login } from "@/components/auth/connect";
import { Logo } from "@/components/layout/logo";

export function Header() {
  return (
    <header className="-translate-x-1/2 fixed top-6 left-1/2 z-30 flex w-[95vw] max-w-4xl items-center justify-between rounded-full border border-white/20 bg-white/10 px-3 py-2 shadow-lg backdrop-blur-xl sm:py-3 dark:border-white/5 dark:bg-black/40">
      <Logo className="h-6 w-auto sm:h-8" variant="full" />
      <Login variant="header" label="Log in" />
    </header>
  );
}
