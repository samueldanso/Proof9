"use client";

import { AppHeader } from "@/components/layout/app-header";
import { Sidebar } from "@/components/layout/sidebar";
import { Loader } from "@/components/ui/loader";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { Onboarding } from "@/components/auth/onboarding";
import { ProfileSetupGuard } from "@/components/auth/profile-setup-guard";
import { apiClient } from "@/lib/api/client";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  // Official Tomo pattern - direct wagmi usage
  const { address, isConnected } = useAccount();
  const isMobile = useIsMobile();
  const router = useRouter();
  const [profileStatus, setProfileStatus] = useState<{
    loading: boolean;
    hasProfile: boolean;
  }>({ loading: true, hasProfile: false });

  // Check if user has completed onboarding
  useEffect(() => {
    async function checkProfile() {
      if (!isConnected || !address) {
        router.push("/");
        return;
      }

      try {
        const response = await apiClient.get<{ hasProfile: boolean }>(
          `/api/users/${address}/onboarding-status`
        );
        setProfileStatus({
          loading: false,
          hasProfile: response.data?.hasProfile || false,
        });
      } catch (error) {
        // If error checking profile, assume no profile exists
        setProfileStatus({ loading: false, hasProfile: false });
      }
    }

    checkProfile();
  }, [isConnected, address, router]);

  if (!isConnected || !address) {
    return <Loader />;
  }

  // Show loading while checking profile status
  if (profileStatus.loading) {
    return <Loader />;
  }

  // Show onboarding if user hasn't completed profile setup
  if (!profileStatus.hasProfile) {
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
        <aside className="w-64 flex-shrink-0 bg-background">
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
