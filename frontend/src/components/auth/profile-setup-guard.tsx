"use client";

import { useUser } from "@/lib/api/hooks";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { ProfileSetupDialog } from "./profile-setup-dialog";

interface ProfileSetupGuardProps {
  children: React.ReactNode;
}

export function ProfileSetupGuard({ children }: ProfileSetupGuardProps) {
  const { address, isConnected } = useAccount();
  const [showSetupDialog, setShowSetupDialog] = useState(false);

  // Get user data to check if profile setup is needed
  const { data: userResponse, isLoading } = useUser(address || "");
  const userData = userResponse?.data;

  useEffect(() => {
    // Only check for authenticated users
    if (isConnected && address && userData && !isLoading) {
      // Check if user has no display name (needs profile setup)
      const needsProfileSetup = !userData.displayName || userData.displayName.includes("...");

      if (needsProfileSetup) {
        setShowSetupDialog(true);
      }
    }
  }, [isConnected, address, userData, isLoading]);

  const handleProfileSetupComplete = () => {
    setShowSetupDialog(false);
  };

  return (
    <>
      {children}

      {/* Required Profile Setup Modal */}
      <ProfileSetupDialog
        open={showSetupDialog}
        onProfileSetupComplete={handleProfileSetupComplete}
        userAddress={address || ""}
      />
    </>
  );
}
