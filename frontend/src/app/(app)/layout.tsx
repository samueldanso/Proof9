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
      <Sidebar />
      <div className="flex h-full w-full flex-col items-center">
        <AppHeader />
        <div className="hide-scrollbar w-full overflow-x-hidden overflow-y-scroll pb-32">
          <div className=" relative mx-auto flex w-full max-w-[472px] flex-col items-center gap-3">
            {children}
          </div>
        </div>
      </div>
      <MobileNav />
    </div>
  );
}
