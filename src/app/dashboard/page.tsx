"use client";

import { CustomConnectPanel } from "@/components/CustomConnectPanel";
import { WalletBalances } from "@/components/WalletBalances";
import { NFTsPanel } from "@/components/NFTsPanel";
import { ActivityPanel } from "@/components/ActivityPanel";
import { QuickActions } from "@/components/QuickActions";
import { useActiveAccount } from "thirdweb/react";

export default function WalletDashboard() {
  const account = useActiveAccount();

  // Define tokens que soportas, o haz fetch dinámico si prefieres
  const tokens = [
    {
      address: "0xFC5fc05E5146f258A29654c03d351d4a61a856DC",
      symbol: "AGOD",
      decimals: 18,
    },
    {
      address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      symbol: "USDC",
      decimals: 6,
    },
  ];

  return (
    <main className="max-w-2xl mx-auto mt-6 p-4">
      <CustomConnectPanel />
      {account && (
        <>
          <QuickActions />
          <WalletBalances tokens={tokens} />
          <NFTsPanel />
          <ActivityPanel />
        </>
      )}
    </main>
  );
}