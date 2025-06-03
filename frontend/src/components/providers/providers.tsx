"use client";

import { env } from "@/env";
import { getPublicClient } from "@/lib/lens/client";
import { chains } from "@lens-chain/sdk/viem";
import { LensProvider } from "@lens-protocol/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { JSX } from "react";
import { http, WagmiProvider, createConfig } from "wagmi";

const wagmiConfig = createConfig(
  getDefaultConfig({
    walletConnectProjectId: env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",
    chains: [chains.mainnet],
    transports: {
      [chains.mainnet.id]: http(`https://rpc.lens.xyz`),
      [chains.testnet.id]: http(`https://rpc.testnet.lens.dev`),
    },
    appName: "Believr",
    appDescription: "Where early believers co-invest in creators' success and share in the rise",
    appUrl: env.NEXT_PUBLIC_APP_URL,
    appIcon: `${env.NEXT_PUBLIC_APP_URL}/favicon.svg`,
  }),
);

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient();
  const publicClient = getPublicClient();

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>
          <LensProvider client={publicClient}>{children}</LensProvider>
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
