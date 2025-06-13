"use client";

import { Onboarding } from "@/components/auth/onboarding";
import { ProfileSetupGuard } from "@/components/auth/profile-setup-guard";
import { AppHeader } from "@/components/layout/app-header";
import { Sidebar } from "@/components/layout/sidebar";
import { Loader } from "@/components/ui/loader";
import { useOnboardingStatus } from "@/hooks/api";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAccount } from "wagmi";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { address, isConnected } = useAccount();
  const isMobile = useIsMobile();
  const router = useRouter();

  // Use the onboarding status hook
  const { data: onboardingData, isLoading: profileLoading } = useOnboardingStatus(address || "");

  // Redirect to home if not connected
  useEffect(() => {
    if (!isConnected || !address) {
      router.push("/");
    }
  }, [isConnected, address, router]);

  if (!isConnected || !address) {
    return <Loader />;
  }

  // Show loading while checking profile status
  if (profileLoading) {
    return <Loader />;
  }

  // Show onboarding if user hasn't completed profile setup
  if (!onboardingData?.data?.hasProfile) {
    return <Onboarding />;
  }

  if (isMobile) {
    return (
      <ProfileSetupGuard>
        <div className="flex h-screen w-full flex-col overflow-hidden">
          <AppHeader />
          <main className="hide-scrollbar flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-2xl px-4 pt-4">{children}</div>
          </main>
        </div>
      </ProfileSetupGuard>
    );
  }

  return (
    <ProfileSetupGuard>
      <div className="flex h-screen w-full overflow-hidden">
        <aside className="w-64 flex-shrink-0 bg-muted/30">
          <Sidebar />
        </aside>
        <div className="flex h-full flex-1 flex-col overflow-hidden">
          <AppHeader />
          <main className="hide-scrollbar flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-6xl px-6 pt-6">{children}</div>
          </main>
        </div>
      </div>
    </ProfileSetupGuard>
  );
}
