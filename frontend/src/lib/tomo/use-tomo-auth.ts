"use client";

import { useAccount, useDisconnect, useSignMessage } from "wagmi";
import { useMemo, useState } from "react";
import { useConnectModal } from "@tomo-inc/tomo-evm-kit";

export interface AuthUser {
  address: string;
  isConnected: boolean;
}

export function useTomoAuth() {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const [isLoading, setIsLoading] = useState(false);

  // User object representing the authenticated user
  const user = useMemo<AuthUser | undefined>(() => {
    if (!isConnected || !address) return undefined;

    return {
      address,
      isConnected,
    };
  }, [address, isConnected]);

  // Function to sign a message for authentication purposes
  async function signMessage(message: string): Promise<string> {
    if (!isConnected) throw new Error("Not connected");

    try {
      setIsLoading(true);
      const signature = await signMessageAsync({ message });
      return signature;
    } catch (error) {
      console.error("Error signing message:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  return {
    user,
    isConnected,
    isLoading,
    connect: openConnectModal,
    disconnect,
    signMessage,
  };
}
