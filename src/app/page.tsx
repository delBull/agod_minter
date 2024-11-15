"use client";

import Image from "next/image";
import { TokenMint } from "@/components/token-mint";

// Constants and Client Imports
import {
  defaultChainId,
  defaultTokenContractAddress,
} from "@/lib/constants";
import { client } from "@/lib/thirdwebClient";

// Thirdweb SDK and Extensions
import { defineChain, getContract, toTokens } from "thirdweb";
import { getContractMetadata } from "thirdweb/extensions/common";
import {
  getActiveClaimCondition as getActiveClaimCondition20,
  getCurrencyMetadata,
  isERC20 as checkIsERC20, // Renombramos para evitar confusión
} from "thirdweb/extensions/erc20";

// React Hooks
import { useReadContract } from "thirdweb/react";

export default function Home(): JSX.Element {
  // Chain and Contract Setup
  const chain = defineChain(defaultChainId);
  const contract = getContract({
    address: defaultTokenContractAddress,
    chain,
    client,
  });

  // Check if the contract is ERC20 using the correct extension
  const { data: isERC20Data, isLoading: loadingIsERC20 } = useReadContract(
	contract,
	"isERC20"
	);

  // Asegúrate de que isERC20 sea de tipo booleano
  const isERC20: boolean = isERC20Data === true;

  // Contract Metadata and Claim Condition Queries
  const contractMetadataQuery = useReadContract(getContractMetadata, {
    contract,
  });

  // Asegúrate de que claimCondition20 solo se ejecute si isERC20 es true
  const claimCondition20 = useReadContract(getActiveClaimCondition20, {
    contract,
    queryOptions: { enabled: !loadingIsERC20 && isERC20 }, // Solo habilitar si no está cargando y es un ERC20
  });

  // Token and Currency Metadata
  const displayName = contractMetadataQuery.data?.name || "";
  const description = contractMetadataQuery.data?.description || "";
  const priceInWei = claimCondition20.data?.pricePerToken;
  const currency = claimCondition20.data?.currency;

  // Currency Contract and Metadata
  const currencyContract = getContract({
    address: currency || "",
    chain,
    client,
  });

  const currencyMetadata = useReadContract(getCurrencyMetadata, {
    contract: currencyContract,
    queryOptions: { enabled: !!currency }, // Esto es correcto, !!currency es un booleano
  });

  const currencySymbol = currencyMetadata.data?.symbol || "";

  const pricePerToken: number | null =
    currencyMetadata.data && priceInWei !== null && priceInWei !== undefined
        ? Number(toTokens(priceInWei, currencyMetadata.data.decimals))
        : null; // Cambia `undefined` a `null`

  return (
    <main className="p-4 pb-10 min-h-[100vh] flex items-center justify-center container max-w-screen-lg mx-auto">
      <div className="py-20">
        <Header />
        <TokenMint
          contract={contract}
          displayName={displayName}
          contractImage={contractMetadataQuery.data?.image || ""}
          description={description}
          currencySymbol={currencySymbol}
          pricePerToken={pricePerToken}
          isERC20={isERC20}
        />
        <ThirdwebResources />
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
        className="hidden size-[150px] md:size-[150px]"
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
    <div className="grid gap-4 lg:grid-cols-3 justify-center">
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
        <h2 className="text-lg font-semibold mb-2">{title}</h2>
        <p className="text-sm text-zinc-400">{description}</p>
      </article>
    </a>
  );
}
