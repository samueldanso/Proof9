"use client";

import { Button } from "@/components/ui/button";
import { useConnectModal, useAccountModal } from "@tomo-inc/tomo-evm-kit";
import { useAccount } from "wagmi";

interface ConnectButtonProps {
  variant?: "default" | "sidebar";
  label?: string;
}

export function ConnectButton({
  variant = "default",
  label = "Connect Wallet",
}: ConnectButtonProps) {
  // Official Tomo hooks - exactly as per documentation
  const { openConnectModal } = useConnectModal();
  const { openAccountModal } = useAccountModal();
  const { address, isConnected } = useAccount();

  // For connected users - show account modal (official Tomo pattern)
  if (isConnected && address) {
    const displayAddress = `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;

    return (
      <div className="space-y-2">
        <Button
          onClick={openAccountModal}
          className="w-full bg-[#ced925] text-black hover:bg-[#b8c220] justify-start"
          variant="default"
        >
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 bg-green-500 rounded-full" />
            <span className="font-medium">{displayAddress}</span>
          </div>
        </Button>
        {variant === "sidebar" && (
          <p className="text-xs text-muted-foreground px-2">
            Tap to manage wallet
          </p>
        )}
      </div>
    );
  }

  // For disconnected users - show connect modal (official Tomo pattern)
  return (
    <Button
      onClick={openConnectModal}
      className="w-full bg-[#ced925] text-black hover:bg-[#b8c220]"
      variant="default"
    >
      {label}
    </Button>
  );
}

// Keep Login as alias for backward compatibility
export { ConnectButton as Login };
