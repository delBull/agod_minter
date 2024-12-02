"use client";

import { toast } from "sonner";
import { useActiveAccount, ClaimButton } from "thirdweb/react";
import type { ThirdwebContract } from "thirdweb";
import { baseChain } from "@/lib/chains";
import { client } from "@/lib/thirdwebClient";
import { CONTRACTS, CHAIN_CONFIG } from "@/lib/constants";

export type TransactionStep = -1 | 0 | 1 | 2 | 3;

interface Props {
    contract: ThirdwebContract;
    setTransactionStep: (step: TransactionStep) => void;
    setShowTransactionStatus: (show: boolean) => void;
    quantity: number;
    updateBalance: () => Promise<void>;
}

const toastStyle = {
    style: {
        background: "linear-gradient(to right, #9333ea, #db2777)",
        color: "white",
        fontFamily: "monospace",
        fontSize: "1rem",
        borderRadius: "0.5rem",
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
        border: "none",
    },
    duration: 5000,
};

export const useTokenMintLogic = (props: Props) => {
    const account = useActiveAccount();

    const renderMintButton = (quantity: number, useCustomAddress: boolean, customAddress: string, isMinting: boolean) => {
        if (!account) return null;

        return (
            <ClaimButton
                theme="dark"
                contractAddress={props.contract.address}
                chain={baseChain}
                client={client}
                claimParams={{
                    type: "ERC20",
                    quantity: String(quantity),
                    to: useCustomAddress ? customAddress : account.address,
                    from: account.address
                }}
                payModal={{
                    metadata: {
                        name: `Mint ${quantity} AGOD Token${quantity > 1 ? 's' : ''}`,
                        image: "/icon.png"
                    },
                    supportedTokens: {
                        [baseChain.id]: [{
                            address: CONTRACTS.USDC,
                            name: "USD Coin",
                            symbol: CHAIN_CONFIG.CURRENCY.SYMBOL,
                            icon: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png"
                        }]
                    }
                }}
                style={{
                    width: "100%",
                    background: "linear-gradient(to right, #9333ea, #db2777)",
                    color: "white",
                    padding: "10px",
                    borderRadius: "0.5rem",
                    fontFamily: "monospace"
                }}
                disabled={isMinting}
                onTransactionSent={() => {
                    props.setTransactionStep(1);
                    props.setShowTransactionStatus(true);
                    toast.success("Transacción enviada...", toastStyle);
                }}
                onTransactionConfirmed={async () => {
                    props.setTransactionStep(2);
                    toast.success(`¡${quantity} token${quantity > 1 ? 's' : ''} minteado${quantity > 1 ? 's' : ''} exitosamente! 💰`, toastStyle);
                    await props.updateBalance();
                    
                    // Esperar un momento antes de mostrar el paso completado
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    props.setTransactionStep(3);
                    
                    // Esperar más tiempo antes de cerrar
                    setTimeout(() => {
                        props.setShowTransactionStatus(false);
                        props.setTransactionStep(-1);
                    }, 5000); // Aumentado a 5 segundos
                }}
                onError={(err) => {
                    console.error("Error en minteo:", err);
                    toast.error(err.message, toastStyle);
                    props.setShowTransactionStatus(false);
                    props.setTransactionStep(-1);
                }}
            >
                {isMinting ? "Procesando..." : `Mint ${quantity} Token${quantity > 1 ? "s" : ""}`}
            </ClaimButton>
        );
    };

    return {
        renderMintButton
    };
};

