"use client";

import { TokenMint } from "@/components/token-mint";
import { defaultChainId, defaultTokenContractAddress } from "@/lib/constants";
import { client } from "@/lib/thirdwebClient";
import { defineChain, getContract, toTokens } from "thirdweb";
import { getContractMetadata } from "thirdweb/extensions/common";
import {
    getActiveClaimCondition as getActiveClaimCondition20,
    isERC20,
} from "thirdweb/extensions/erc20";
import { getCurrencyMetadata } from "thirdweb/extensions/erc20";
import { useEffect, useState, Suspense } from 'react';
import type { ContractOptions } from "thirdweb/contract";

interface TokenData {
  contract: ContractOptions<[]> | undefined;
  displayName: string;
  description: string;
  contractImage: string;
  currencySymbol: string;
  pricePerToken: number;
}

function TokenMintContainer() {
  const [tokenData, setTokenData] = useState<TokenData>({
    contract: undefined,
    displayName: "",
    description: "",
    contractImage: "",
    currencySymbol: "",
    pricePerToken: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initializeContract() {
      try {
        const chain = defineChain(defaultChainId);
        const contract = getContract({
          address: defaultTokenContractAddress,
          chain,
          client,
        }) as ContractOptions<[]>;

        const isERC20Result = await isERC20([defaultTokenContractAddress]);
        const [contractMetadataQuery, claimCondition20] = await Promise.all([
          getContractMetadata({ contract }),
          getActiveClaimCondition20({ contract }),
        ]);

        const priceInWei = claimCondition20?.pricePerToken;
        const currency = claimCondition20?.currency;

        let currencyMetadata;
        if (currency) {
          const currencyContract = getContract({
            address: currency,
            chain,
            client,
          });
          currencyMetadata = await getCurrencyMetadata({ contract: currencyContract });
        }

        setTokenData({
          contract,
          displayName: contractMetadataQuery.data?.name || "",
          description: contractMetadataQuery.data?.description || "",
          contractImage: contractMetadataQuery.data?.image || "",
          currencySymbol: currencyMetadata?.symbol || "",
          pricePerToken: currencyMetadata && priceInWei
            ? Number(toTokens(priceInWei, currencyMetadata.decimals))
            : 0
        });
      } catch (error) {
        console.error("Error initializing contract:", error);
        setTokenData({
          contract: undefined,
          displayName: "Error Loading Contract",
          description: "There was an error loading the contract data. Please try again later.",
          contractImage: "",
          currencySymbol: "",
          pricePerToken: 0
        });
      }
    }

    initializeContract();
  }, []);

  if (loading) {
    return <div>Loading token data...</div>;
  }

  if (!tokenData.contract) {
    return <div>Contract not initialized</div>;
  }

  return (
    <TokenMint
      contract={tokenData.contract}
      displayName={tokenData.displayName}
      contractImage={tokenData.contractImage}
      description={tokenData.description}
      currencySymbol={tokenData.currencySymbol}
      pricePerToken={tokenData.pricePerToken}
    />
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading token minter...</div>}>
      <TokenMintContainer />
    </Suspense>
  );
}
