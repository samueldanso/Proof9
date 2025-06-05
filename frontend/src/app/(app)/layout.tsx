"use client";

import { AppHeader } from "@/components/layout/app-header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { Loader } from "@/components/ui/loader";
import { useTomoAuth } from "@/lib/tomo/use-tomo-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isConnected, isLoading } = useTomoAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isConnected) {
      router.push("/");
    }
  }, [isLoading, isConnected, router]);

  if (isLoading) {
    return <Loader />;
  }

  if (!isConnected || !user) {
    return null;
  }

  return (
    <div className="flex h-screen min-h-[800px] w-full items-start">
      <aside className="w-60 flex-shrink-0 border-r bg-background">
        <Sidebar />
      </aside>
      <div className="flex h-full flex-1 flex-col">
        <AppHeader />
        <main className="hide-scrollbar flex-1 overflow-x-hidden overflow-y-scroll">
          <div className="mx-auto w-full max-w-2xl px-4">{children}</div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
