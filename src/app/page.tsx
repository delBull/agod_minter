"use client";

import { TokenMint } from "@/components/token-mint";
import { client } from "@/lib/thirdwebClient";
import { getContract } from "thirdweb/contract";
import { baseChain } from "@/lib/chains";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { EcosystemResources } from "@/components/ecosystem-resources";
import { Vortex } from "@/components/ui/vortex";
import { AlertTriangle } from "lucide-react";

const contractAddress = "0xFC5fc05E5146f258A29654c03d351d4a61a856DC";

function Header(): JSX.Element {
  return (
    <div className="relative w-full md:h-auto h-[300px]">
      <div className="absolute inset-0 md:opacity-100 opacity-50">
        <Vortex
          backgroundColor="transparent"
          baseHue={280}
          baseSpeed={0.5}
          rangeSpeed={1.0}
          particleCount={500}
          className="flex items-center flex-col justify-center px-2 md:px-10 py-4 w-full h-full"
        />
      </div>
      <div className="relative z-10 flex flex-col items-center justify-center py-4 mt-12 md:mt-10">
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

        <h1 className="text-2xl md:text-6xl font-semibold md:font-bold tracking-tighter mb-0 md:mb-6 text-zinc-100">
          AGOD Token
          <span className="text-zinc-300 inline-block mx-1"> · </span>
          <span className="inline-block -skew-x-6 text-red-500"> Minter </span>
        </h1>

        <p className="text-zinc-300 text-base ">
          Abre la puerta tu{" "}
          <code className="bg-zinc-800 text-zinc-300 px-2 rounded py-1 text-sm mx-1">
            UNIVERSO
          </code>{" "}
          Blockchain.
        </p>
      </div>
    </div>
  );
}

interface Props {
  contract: any;
  displayName: string;
  description: string;
  contractImage: string;
  pricePerToken: number;
  currencySymbol: string;
  isERC20: boolean;
}

export default function Home() {
  const [contract, setContract] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Show safety alert on page load
    setTimeout(() => {
      toast.info(
        <div className="flex text-white font-mono items-center gap-2 rounded-lg p-[1px]">
          <AlertTriangle className="h-5 w-5 text-white shrink-0" />
          <span>Alerta: ¡Siempre verifica que estés en minter.agodecosystem.com!</span>
        </div>,
        {
          duration: 4000,
          position: "top-center",
          className: "",
        }
      );
    }, 500);

    const initContract = async () => {
      try {
        console.log("Initializing contract on chain:", baseChain.name);
        const newContract = getContract({
          client,
          address: contractAddress,
          chain: baseChain
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
    <main className="p-4 pb-24 md:pb-10 max-h-screen flex items-center justify-center bg-zinc-950">
      <div className="max-w-screen-lg w-full mx-auto bg-zinc-950">
        <div className="py-0 md:py-0 w-full space-y-12">
          <Header />
          <TokenMint
            contract={contract}
            displayName=""
            description=""
            contractImage="/icon.png"
            pricePerToken={0.007}
            currencySymbol="USDC"
          />
          <EcosystemResources />
        </div>
      </div>
    </main>
  );
}
