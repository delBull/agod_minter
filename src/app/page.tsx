"use client";

import Head from "next/head";
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
import Image from "next/image";

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
      <Head>
        <title>AGOD Token minter</title>
        <meta name="description" content="Mintea AGOD Token y abre la puerta al universo Blockchain" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="py-20 w-full space-y-12">
        <Header />
        <TokenMint
          contract={contract}
          displayName={metadata?.name || "AGOD Token"}
          contractImage={metadata?.image || "/icon.png"}
          description={metadata?.description || ""}
          currencySymbol="ETH"
          pricePerToken={0.001}
          isERC20={true}
        />
        <ThirdwebResources />
      </div>
     </div>
    </main>
  );
}

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

function ThirdwebResources(): JSX.Element {
  return (
    <div className="grid gap-4 lg:grid-cols-3 justify-center mt-12">
      <ArticleCard
        title="Pandora's Foundation"
        href="https://pandoras.foundation"
        description="Un mundo nuevo, tokenización de RWA"
      />
      <ArticleCard
        title="AGOD Ecosystem"
        href="https://agodecosystem.com"
        description="La descripción"
      />
      <ArticleCard
        title="Harmony Ark Foundation"
        href="https://harmonyearth.me"
        description="La descripción."
      />
    </div>
  );
}

interface ArticleCardProps {
  title: string;
  href: string;
  description: string;
}

function ArticleCard({ title, href, description }: ArticleCardProps): JSX.Element {
  return (
    <a
      href={`${href}?utm_source=next-template`}
      target="_blank"
      className="flex flex-col border border-zinc-800 p-4 rounded-lg hover:bg-zinc-900 transition-colors hover:border-zinc-700"
    >
      <article>
        <h2 className="text-lg font-semibold mb-2 text-zinc-100">{title}</h2>
        <p className="text-sm text-zinc-400">{description}</p>
      </article>
    </a>
  );
}
