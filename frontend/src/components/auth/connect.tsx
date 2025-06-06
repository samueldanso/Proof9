"use client";

import { Button } from "@/components/ui/button";
import { useAccountModal, useConnectModal } from "@tomo-inc/tomo-evm-kit";
import { useAccount } from "wagmi";

interface ConnectButtonProps {
  variant?: "default" | "header" | "sidebar";
  label?: string;
}

export function ConnectButton({
  variant = "default",
  label = "Connect Wallet",
}: ConnectButtonProps) {
  const { openConnectModal } = useConnectModal();
  const { openAccountModal } = useAccountModal();
  const { address, isConnected, connector } = useAccount();

  // Apply different styles based on variant
  const containerClasses = variant === "header" ? "" : "mb-4 space-y-4 p-2";
  const buttonClasses = variant === "header" ? "" : "w-[250px]";

  // For connected users - show account modal
  if (isConnected && address) {
    const displayAddress = `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;

    return (
      <div className={containerClasses}>
        <Button
          onClick={openAccountModal}
          className={`bg-primary text-primary-foreground hover:bg-primary/90 ${buttonClasses}`}
          variant="default"
        >
          <div className="flex items-center gap-2">
            {connector?.name && <span className="text-xs opacity-75">{connector.name}</span>}
            <span>{displayAddress}</span>
          </div>
        </Button>
        {variant === "sidebar" && (
          <p className="px-2 text-muted-foreground text-xs">Connected via {connector?.name}</p>
        )}
      </div>
    );
  }

  // For disconnected users - show connect modal
  return (
    <div className={containerClasses}>
      <Button
        onClick={openConnectModal}
        className={`bg-primary text-primary-foreground hover:bg-primary/90 ${buttonClasses}`}
        variant="default"
      >
        {label}
      </Button>
    </div>
  );
}

// Keep Login as alias for backward compatibility
export { ConnectButton as Login };
