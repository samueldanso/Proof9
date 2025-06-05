"use client";

import { Login } from "@/components/auth/login";
import { Logo } from "@/components/layout/logo";

export function Header() {
  return (
    <header className="-translate-x-1/2 fixed top-6 left-1/2 z-30 flex w-[95vw] max-w-3xl items-center justify-between rounded-full border border-border bg-background/80 px-8 py-3 shadow-lg backdrop-blur-md">
      <Logo className="h-12 w-auto" variant="full" />
      <Login variant="header" label="Sign in" />
    </header>
  );
}
