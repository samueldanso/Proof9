"use client";

import { Button } from "@/components/ui/button";
import { useTomoAuth } from "@/lib/tomo/use-tomo-auth";
import { CircleNotch } from "@phosphor-icons/react";
import { useAccount } from "wagmi";

interface LoginProps {
  variant?: "default" | "header" | "sidebar";
  label?: string;
}

export function Login({ variant = "default", label = "Get Started" }: LoginProps) {
  const { user, isConnected, isLoading, connect, disconnect } = useTomoAuth();
  const { address, connector } = useAccount();

  // Apply different styles based on variant
  const containerClasses = variant === "header" ? "" : "mb-2 space-y-2 p-2";
  const buttonClasses = variant === "header" ? "" : "w-full";

  // Format address for display
  const formatAddress = (address: string) => {
    if (!address) return "...";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const displayAddress = address ? formatAddress(address) : "";

  // Handling disconnect to avoid type error
  const handleDisconnect = () => {
    disconnect();
  };

  return (
    <div className={containerClasses}>
      {!isConnected ? (
        <Button
          onClick={connect}
          className={
            buttonClasses +
            " border-none bg-[#ced925] font-semibold text-base text-black hover:bg-[#e6f57a]"
          }
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <CircleNotch className="mr-2 size-4 animate-spin" weight="bold" />
              Connecting...
            </>
          ) : (
            label
          )}
        </Button>
      ) : (
        <div className="flex flex-col gap-2">
          <div className={`flex items-center justify-between gap-2 text-sm ${buttonClasses}`}>
            <span className="truncate text-muted-foreground" title={address}>
              Signed in as: <span className="font-semibold text-primary">{displayAddress}</span>
              {connector?.name && (
                <span className="ml-1 text-muted-foreground text-xs">via {connector.name}</span>
              )}
            </span>
          </div>
          <Button onClick={handleDisconnect} variant="outline" size="sm" className={buttonClasses}>
            Disconnect
          </Button>
        </div>
      )}
    </div>
  );
}
