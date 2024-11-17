"use client";

import { ThirdwebProvider } from "@thirdweb-dev/react";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Sepolia } from "@thirdweb-dev/chains";

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
        clientId={process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID}
      >
        {children}
      </ThirdwebProvider>
    </QueryClientProvider>
  );
}
