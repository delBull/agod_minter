"use client";

import { TokenMint } from "@/components/token-mint";
import { client } from "@/lib/thirdwebClient";
import { getContract } from "thirdweb/contract";
import { sepoliaChain } from "@/lib/chains";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { EcosystemResources } from "@/components/ecosystem-resources";

const contractAddress = "0xc655e27d77b7a921e45c603f4d0a474bdeedb42b";

function Header(): JSX.Element {
  return (
    <header className="flex flex-col items-center">
      <Image
        src="/icon.png"
        height={150}
        width={150}
        alt=""
        className="size-[150px] md:size-[150px] md:block"
        style={{
          filter: "drop-shadow(0px 0px 24px #a726a9a8)",
        }}
      />

      <h1 className="text-2xl md:text-6xl font-semibold md:font-bold tracking-tighter mb-6 text-zinc-100">
        AGOD Token
        <span className="text-zinc-300 inline-block mx-1"> · </span>
        <span className="inline-block -skew-x-6 text-red-500"> Minter </span>
      </h1>

      <p className="text-zinc-300 text-base">
        Abre la puerta al{" "}
        <code className="bg-zinc-800 text-zinc-300 px-2 rounded py-1 text-sm mx-1">
          UNIVERSO
        </code>{" "}
        Blockchain.
      </p>
    </header>
  );
}

export default function Home() {
  const [contract, setContract] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initContract = async () => {
      try {
        console.log("Initializing contract on chain:", sepoliaChain.name);
        const newContract = getContract({
          client,
          address: contractAddress,
          chain: sepoliaChain
        });
        console.log("Contract initialized successfully");
        setContract(newContract);
      } catch (err) {
        console.error("Error initializing contract:", err);
        const errorMessage = err instanceof Error ? err.message : "Error initializing contract";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    };

    initContract();
  }, []);

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="text-red-500">{error}</div>
      </main>
    );
  }

  if (!contract) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-zinc-400">Conectando a AGOD Minter...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="p-4 pb-10 min-h-[100vh] flex items-center justify-center bg-zinc-950">
      <div className="max-w-screen-lg w-full mx-auto bg-zinc-950">
        <div className="py-20 w-full space-y-12">
          <Header />
          <TokenMint
            contract={contract}
            displayName=""
            description=""
            contractImage="/icon.png"
            pricePerToken={1}
            currencySymbol="USDT"
            isERC20={true}
          />
          <EcosystemResources />
        </div>
      </div>
    </main>
  );
}
