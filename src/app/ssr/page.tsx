"use client";

import { TokenMint } from "@/components/token-mint";
import {
    defaultChainId,
    defaultTokenContractAddress,
} from "@/lib/constants";
import { client } from "@/lib/thirdwebClient";
import { defineChain, getContract, toTokens } from "thirdweb";
import { getContractMetadata } from "thirdweb/extensions/common";
import {
    getActiveClaimCondition as getActiveClaimCondition20,
    isERC20,
} from "thirdweb/extensions/erc20";
import { getCurrencyMetadata } from "thirdweb/extensions/erc20";

// Página SSR actualizada para Tokens
export default async function Home() {
    const chain = defineChain(defaultChainId);
    const contract = getContract({
        address: defaultTokenContractAddress,
        chain,
        client,
    });

    try {
        // Verifica si el contrato es ERC20 usando la dirección del contrato
        const isERC20Result = await isERC20([defaultTokenContractAddress]);
        const isERC20Query = Array.isArray(isERC20Result) && isERC20Result.length > 0 
            ? isERC20Result[0] 
            : false;

        const [contractMetadataQuery, claimCondition20] = await Promise.all([
            getContractMetadata({ contract }),
            getActiveClaimCondition20({ contract }),
        ]);

        const displayName = contractMetadataQuery.data?.name || "";
        const description = contractMetadataQuery.data?.description || "";

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

        const currencySymbol = currencyMetadata?.symbol || "";

        // Ensure pricePerToken is always a number, defaulting to 0 if null
        const pricePerToken = currencyMetadata && priceInWei
            ? Number(toTokens(priceInWei, currencyMetadata.decimals))
            : 0;

        return (
            <TokenMint
                contract={contract}
                displayName={displayName}
                contractImage={contractMetadataQuery.data?.image || ""}
                description={description}
                currencySymbol={currencySymbol}
                pricePerToken={pricePerToken}
                isERC20={isERC20Query}
            />
        );
    } catch (error) {
        console.error("Error loading contract data:", error);
        // Return a minimal version of TokenMint with error state
        return (
            <TokenMint
                contract={contract}
                displayName="Error Loading Contract"
                contractImage=""
                description="There was an error loading the contract data. Please try again later."
                currencySymbol=""
                pricePerToken={0}
                isERC20={false}
            />
        );
    }
}
