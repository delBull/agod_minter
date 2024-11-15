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

    // Verifica si el contrato es ERC20
    const isERC20Query = await isERC20({ contract });

    const [contractMetadataQuery, claimCondition20] = await Promise.all([
        getContractMetadata({ contract }),
        getActiveClaimCondition20({ contract }),
    ]);

    const displayName = contractMetadataQuery.data?.name || "";
    const description = contractMetadataQuery.data?.description || "";

    const priceInWei = claimCondition20?.pricePerToken;
    const currency = claimCondition20?.currency;

    const currencyMetadata = currency
        ? await getCurrencyMetadata({
              contract: getContract({
                  address: currency || "",
                  chain,
                  client,
              }),
          })
        : undefined;

    const currencySymbol = currencyMetadata?.symbol || "";

    const pricePerToken =
        currencyMetadata && priceInWei
            ? Number(toTokens(priceInWei, currencyMetadata.decimals))
            : null;

    return (
        <TokenMint
            contract={contract}
            displayName={displayName}
            contractImage={contractMetadataQuery.data?.image || ""}
            description={description}
            currencySymbol={currencySymbol}
            pricePerToken={pricePerToken}
            isERC20={isERC20Query} // Cambiado para utilizar el resultado de la verificación
        />
    );
}