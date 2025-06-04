"use client";

import { env } from "@/env";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TomoEVMKitProvider, darkTheme, getDefaultConfig } from "@tomo-inc/tomo-evm-kit";
import "@tomo-inc/tomo-evm-kit/styles.css";
import { metaMaskWallet, rainbowWallet, walletConnectWallet } from "@tomo-inc/tomo-evm-kit/wallets";
import { WagmiProvider } from "wagmi";
import { storyAeneid } from "wagmi/chains";

const config = getDefaultConfig({
  clientId: env.NEXT_PUBLIC_TOMO_CLIENT_ID,
  appName: "Proof9",
  appDescription:
    "A sound rights platform where creators protect, verify, license, and monetize their sound IP",
  projectId: env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
  chains: [storyAeneid],
  ssr: true,
  wallets: [
    {
      groupName: "Popular",
      wallets: [metaMaskWallet, rainbowWallet, walletConnectWallet],
    },
  ],
});

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient();

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <TomoEVMKitProvider
          theme={darkTheme({
            accentColor: "#ced925",
            accentColorForeground: "#000000",
          })}
        >
          {children}
        </TomoEVMKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
