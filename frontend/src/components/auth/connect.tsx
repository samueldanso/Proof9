"use client";

import { Button } from "@/components/ui/button";
import { useConnectModal, useAccountModal } from "@tomo-inc/tomo-evm-kit";
import { useAccount } from "wagmi";

interface ConnectButtonProps {
  variant?: "default" | "sidebar";
  label?: string;
  className?: string;
}

export function ConnectButton({
  variant = "default",
  label = "Connect Wallet",
  className = "",
}: ConnectButtonProps) {
  const { openConnectModal } = useConnectModal();
  const { openAccountModal } = useAccountModal();
  const { address, isConnected } = useAccount();

  // For connected users - show account modal (official Tomo pattern)
  if (isConnected && address) {
    const displayAddress = `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;

    if (variant === "sidebar") {
      // Minimalistic sidebar styling - clean display without button appearance
      return (
        <div
          onClick={openAccountModal}
          className={`w-full rounded-lg border border-border/30 bg-transparent hover:border-border/60 text-foreground cursor-pointer transition-colors px-3 py-2 ${className}`}
        >
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 bg-green-500 rounded-full" />
            <span className="font-medium text-sm">{displayAddress}</span>
          </div>
        </div>
      );
    }

    // Default styling with primary color (for header/landing)
    return (
      <Button
        onClick={openAccountModal}
        className={`bg-[#ced925] text-black hover:bg-[#b8c220] ${className}`}
        variant="default"
      >
        {displayAddress}
      </Button>
    );
  }

  // For disconnected users - show connect modal (official Tomo pattern)
  if (variant === "sidebar") {
    // Sidebar styling - match navigation links
    return (
      <Button
        onClick={openConnectModal}
        className={`w-full rounded-lg border border-border bg-background hover:bg-accent/50 text-foreground ${className}`}
        variant="outline"
      >
        {label}
      </Button>
    );
  }

  // Default styling with primary color (for header/landing)
  return (
    <Button
      onClick={openConnectModal}
      className={`bg-[#ced925] text-black hover:bg-[#b8c220] ${className}`}
      variant="default"
    >
      {label}
    </Button>
  );
}

// Keep Login as alias for backward compatibility
export { ConnectButton as Login };
