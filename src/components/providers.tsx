"use client";

import { ThirdwebProvider } from "@thirdweb-dev/react";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Sepolia } from "@thirdweb-dev/chains";
import {
  metamaskWallet,
  coinbaseWallet,
  walletConnect,
} from "@thirdweb-dev/react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="bottom-center" />
      <ThirdwebProvider
        activeChain={Sepolia}
        supportedWallets={[
          metamaskWallet(),
          coinbaseWallet(),
          walletConnect()
        ]}
        sdkOptions={{
          clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID,
          secretKey: process.env.NEXT_PUBLIC_THIRDWEB_SECRET_KEY,
          gatewayUrls: ["https://ipfs.thirdwebcdn.com"],
        }}
        authConfig={{
          domain: process.env.NEXT_PUBLIC_AUTH_DOMAIN || window.location.origin,
          authUrl: "/api/auth",
        }}
      >
        {children}
      </ThirdwebProvider>
    </QueryClientProvider>
  );
}
