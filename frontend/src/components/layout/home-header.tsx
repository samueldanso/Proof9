"use client";

import { Logo } from "@/components/layout/logo";
import { Login } from "@/components/auth/login";

export function HomeHeader() {
  return (
    <header className="fixed top-0 left-0 z-20 w-full bg-background/90 py-3 shadow-sm backdrop-blur-md">
      <div className="container mx-auto flex max-w-6xl items-center justify-between px-4 md:px-6">
        <Logo className="mr-6" variant="full" />
        <Login variant="header" label="Sign in" />
      </div>
    </header>
  );
}
