"use client";

import { TokenMint } from "@/components/token-mint";
import {
  defaultChainId,
  defaultTokenContractAddress,
} from "@/lib/constants";
import { client } from "@/lib/thirdwebClient";
import { sepolia } from "thirdweb/chains";
import { getContract } from "thirdweb";
import { getContractMetadata } from "thirdweb/extensions/common";
import { getActiveClaimCondition } from "thirdweb/extensions/erc20";
import { useReadContract } from "thirdweb/react";

export default function Home() {
  const contract = getContract({
    address: defaultTokenContractAddress,
    chain: sepolia,
    client,
  });

  const { data: metadata, isLoading: isLoadingMetadata } = useReadContract(
    getContractMetadata,
    { contract }
  );

  const { data: claimCondition } = useReadContract(
    getActiveClaimCondition,
    { contract }
  );

  // Loading State
  if (!contract || !metadata || isLoadingMetadata) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-zinc-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-zinc-400">Conectando al contrato...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <TokenMint
          contract={contract}
          displayName={metadata?.name || "AGOD Token"}
          contractImage={metadata?.image || "/icon.png"}
          description={metadata?.description || ""}
          currencySymbol="ETH"
          pricePerToken={0.001}
          isERC20={true}
        />
      </div>
    </main>
  );
}
