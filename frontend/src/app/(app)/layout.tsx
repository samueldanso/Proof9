"use client";

import { Header } from "@/components/layout/header";
import { MobileNavigation } from "@/components/layout/mobile";
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
    <div className="flex min-h-screen flex-col bg-[#F7F8F9] dark:bg-background">
      <Header />
      <main className="mx-auto mt-16 w-full max-w-6xl flex-1 md:mt-20">{children}</main>
      <MobileNavigation />
    </div>
  );
}
