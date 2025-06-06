"use client";

import { AppHeader } from "@/components/layout/app-header";
import { Sidebar } from "@/components/layout/sidebar";
import { Loader } from "@/components/ui/loader";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAccount } from "wagmi";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  // Official Tomo pattern - direct wagmi usage
  const { address, isConnected } = useAccount();
  const isMobile = useIsMobile();
  const router = useRouter();

  useEffect(() => {
    if (!isConnected || !address) {
      router.push("/");
    }
  }, [isConnected, address, router]);

  if (!isConnected || !address) {
    return <Loader />;
  }

  if (isMobile) {
    return (
      <div className="flex h-screen w-full flex-col overflow-hidden">
        <AppHeader />
        <main className="hide-scrollbar flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-2xl px-4 pt-4">{children}</div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <aside className="w-72 flex-shrink-0 border-r bg-background">
        <Sidebar />
      </aside>
      <div className="flex h-full flex-1 flex-col overflow-hidden">
        <AppHeader />
        <main className="hide-scrollbar flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-2xl px-6 pt-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
