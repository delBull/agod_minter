"use client";

import Image from "next/image";
import { TokenMint } from "@/components/token-mint";
import {
	defaultChainId,
	defaultTokenContractAddress,
} from "@/lib/constants";
import { client } from "@/lib/thirdwebClient";
import { defineChain, getContract, toTokens } from "thirdweb";
import { getContractMetadata } from "thirdweb/extensions/common";
import { getActiveClaimCondition as getActiveClaimCondition20 } from "thirdweb/extensions/erc20";
import { getCurrencyMetadata } from "thirdweb/extensions/erc20";
import { isERC20 } from "thirdweb/extensions/erc20";
import { useReadContract } from "thirdweb/react";

// This page renders on the client.
export default function Home() {
	const chain = defineChain(defaultChainId);
	const contract = getContract({
		address: defaultTokenContractAddress,
		chain,
		client,
	});
	const isERC20Query = useReadContract(isERC20, { contract });
	const contractMetadataQuery = useReadContract(getContractMetadata, {
		contract,
	});

	const claimCondition20 = useReadContract(getActiveClaimCondition20, {
		contract,
		queryOptions: { enabled: isERC20Query.data },
	});

	const displayName = contractMetadataQuery.data?.name || "";
	const description = contractMetadataQuery.data?.description || "";

	const priceInWei = claimCondition20.data?.pricePerToken;
	const currency = claimCondition20.data?.currency;

	const currencyContract = getContract({
		address: currency || "",
		chain,
		client,
	});

	const currencyMetadata = useReadContract(getCurrencyMetadata, {
		contract: currencyContract,
		queryOptions: { enabled: !!currency },
	});

	const currencySymbol = currencyMetadata.data?.symbol || "";

	const pricePerToken =
		currencyMetadata.data && priceInWei !== null && priceInWei !== undefined
			? Number(toTokens(priceInWei, currencyMetadata.data.decimals))
			: null;

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
					isERC20={!!isERC20Query.data}
				/>
				<ThirdwebResources />
			</div>
		</main>
	);
}

function Header() {
	return (
	  <header className="flex flex-col items-center ">
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
  
  function ThirdwebResources() {
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
  
  function ArticleCard(props: {
	title: string;
	href: string;
	description: string;
  }) {
	return (
	  <a
		href={props.href + "?utm_source=next-template"}
		target="_blank"
		className="flex flex-col border border-zinc-800 p-4 rounded-lg hover:bg-zinc-900 transition-colors hover:border-zinc-700"
	  >
		<article>
		  <h2 className="text-lg font-semibold mb-2">{props.title}</h2>
		  <p className="text-sm text-zinc-400">{props.description}</p>
		</article>
	  </a>
	);
  }