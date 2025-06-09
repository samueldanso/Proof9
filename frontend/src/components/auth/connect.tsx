"use client";

import { Button } from "@/components/ui/button";
import { useAccountModal, useConnectModal } from "@tomo-inc/tomo-evm-kit";
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

  // For connected users - show account modal
  if (isConnected && address) {
    const displayAddress = `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;

    if (variant === "sidebar") {
      return (
        <div
          onClick={openAccountModal}
          className={`w-full cursor-pointer rounded-lg bg-transparent px-3 py-2 text-foreground transition-colors hover:bg-accent/20 ${className}`}
        >
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span className="font-medium text-sm">{displayAddress}</span>
          </div>
        </div>
      );
    }

    // Default styling with primary color (for header/landing)
    return (
      <Button
        onClick={openAccountModal}
        className={`h-9 border border-border bg-muted/50 px-3 py-2 font-medium text-foreground text-sm hover:bg-muted ${className}`}
        variant="ghost"
      >
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span>{displayAddress}</span>
        </div>
      </Button>
    );
  }

  // For disconnected users - show connect modal
  if (variant === "sidebar") {
    // Sidebar styling
    return (
      <Button
        onClick={openConnectModal}
        className={`w-full rounded-lg border border-border bg-background text-foreground hover:bg-accent/50 ${className}`}
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
      className={`h-9 border border-border bg-muted/50 px-3 py-2 font-medium text-foreground text-sm hover:bg-muted ${className}`}
      variant="ghost"
    >
      {label}
    </Button>
  );
}

// Keep Login as alias for backward compatibility
export { ConnectButton as Login };
