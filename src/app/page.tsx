"use client";

import { TokenMint } from "@/components/token-mint";
import { InvestPool } from "@/components/invest-pool";
import { client } from "@/lib/thirdwebClient";
import { getContract } from "thirdweb/contract";
import { baseChain } from "@/lib/chains";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { EcosystemResources } from "@/components/ecosystem-resources";
import { Vortex } from "@/components/ui/vortex";
import { AlertTriangle } from "lucide-react";
import { ConnectButton } from "thirdweb/react";
import { inAppWallet, createWallet } from "thirdweb/wallets";

const contractAddress = "0xFC5fc05E5146f258A29654c03d351d4a61a856DC";

const wallets = [
    inAppWallet({
        auth: {
          options: [
            "google",
            "discord",
            "email",
            "x",
            "phone",
            "telegram",
          ],
        },
    }),
    createWallet("io.metamask"),
    createWallet("io.rabby"),
    createWallet("walletConnect"),
    createWallet("io.zerion.wallet"),
];

// Componente StyledConnectButton simplificado
function StyledConnectButton() {
    return (
        <div className="relative mt-10 mb-10">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg opacity-50" />
            <div className="w-96 h-0 flex items-center justify-center bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-[1px] transition-colors">
                <div className="rounded-lg z-10">
                    <ConnectButton 
                        client={client}
                        wallets={wallets}
                        connectButton={{
                            label: "Inicia tu Conexión",
                            className: "bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity"
                        }}
                        theme="dark"
                        connectModal={{
                            size: "compact",
                            showThirdwebBranding: false,
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

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
        {/*
        <Image
          src="/icon.png"
          height={150}
          width={150}
          alt=""
          style={{
            filter: "drop-shadow(0px 0px 24px #a726a9a8)",
          }}
        />
      */}

        <h1 className="text-2xl md:text-6xl font-semibold tracking-tighter mb-0 md:mb-6 text-zinc-100">
          AGOD Ecosystem
          <span className="text-zinc-300 inline-block mx-1"> · </span>
          <span className="inline-block -skew-x-6 text-red-500">Minter</span>
        </h1>

        <p className="text-zinc-300 text-base">
          Abre la puerta a tu{" "}
          <code className="bg-zinc-800 text-zinc-300 px-2 rounded py-1 text-sm mx-1">
            UNIVERSO
          </code>{" "}
          Blockchain.
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  const [contract, setContract] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTimeout(() => {
      toast.info(
        <div className="flex text-white font-mono items-center gap-2 rounded-lg p-[1px]">
          <AlertTriangle className="h-5 w-5 text-white shrink-0" />
          <span>Alerta: ¡Siempre verifica que estés en minter.agodecosystem.com!</span>
        </div>,
        { duration: 4000, position: "top-center" }
      );
    }, 500);

    (async () => {
      try {
        const newContract = getContract({
          client,
          address: contractAddress,
          chain: baseChain,
        });
        setContract(newContract);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Error initializing contract";
        setError(msg);
        toast.error(msg);
      }
    })();
  }, []);

  if (error) {
    return <main className="min-h-screen flex items-center justify-center bg-zinc-950"><div className="text-red-500">{error}</div></main>;
  }
  if (!contract) {
    return <main className="min-h-screen flex items-center justify-center bg-zinc-950"><div className="text-zinc-400">Conectando a AGOD Minter...</div></main>;
  }

  return (
    <main className="p-4 pb-24 md:pb-10 flex items-center justify-center bg-zinc-950 min-h-screen">
      <div className="max-w-screen-lg w-full space-y-4">
        <Header />
        <div className="flex justify-center w-full top-0">
            <StyledConnectButton />
         </div>
         <div className="container mx-auto px-4">
        <div className="grid sm:grid-cols-2 gap-2 mb-8 grid-cols-[repeat(auto-fit,_minmax(300px,_1fr))] md:grid-cols-[repeat(auto-fit,_minmax(350px,_1fr))] lg:grid-cols-[repeat(auto-fit,_minmax(400px,_1fr))]">
        <TokenMint
          contract={contract}
          displayName="AGOD Token"
          description="El utility y governance token de AGOD Ecosystem, respaldado por activos reales, te permite participar en decisiones, obtener rendimientos y desbloquear servicios exclusivos."
          contractImage="/icon.png"
          pricePerToken={0.007}
          currencySymbol="USDC"
        />
        <InvestPool />
        </div>
        </div>
        <EcosystemResources />
      </div>
    </main>
  );
}
