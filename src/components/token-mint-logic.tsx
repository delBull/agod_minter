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

const errorMessages = {
    userRejected: "Operación cancelada por el usuario",
    insufficientFunds: "No tienes suficientes fondos para completar la operación",
    default: "Algo salió mal. Por favor, inténtalo más tarde",
    networkError: "Error de conexión. Verifica tu red e inténtalo de nuevo"
};

export const useTokenMintLogic = (props: Props) => {
    const account = useActiveAccount();

    const renderMintButton = (quantity: number, useCustomAddress: boolean, customAddress: string, isMinting: boolean) => {
        if (!account) return null;

        const handleClick = () => {
            // Mostrar el estado inmediatamente al hacer clic
            props.setTransactionStep(0);
            props.setShowTransactionStatus(true);
        };

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
                onClick={handleClick} // Agregar el manejador de clic
                onTransactionSent={() => {
                    toast.success("Iniciando transacción...", toastStyle);
                }}
                onTransactionConfirmed={async () => {
                    props.setTransactionStep(1);
                    toast.success("Aprobando USDC...", toastStyle);
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    
                    props.setTransactionStep(2);
                    toast.success("Preparando transacción...", toastStyle);
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    
                    props.setTransactionStep(3);
                    toast.success(`¡Felicidades! Has minteado ${props.quantity} token${props.quantity > 1 ? 's' : ''} AGOD 🎉`, toastStyle);
                    await props.updateBalance();
                    
                    setTimeout(() => {
                        props.setShowTransactionStatus(false);
                        props.setTransactionStep(-1);
                    }, 5000);
                }}
                onError={(err) => {
                    console.error("Error en minteo:", err);
                    let errorMessage = errorMessages.default;
                    
                    if (err.message.includes("user rejected")) {
                        errorMessage = errorMessages.userRejected;
                    } else if (err.message.includes("insufficient funds")) {
                        errorMessage = errorMessages.insufficientFunds;
                    } else if (err.message.includes("network")) {
                        errorMessage = errorMessages.networkError;
                    }
                    
                    toast.error(errorMessage, toastStyle);
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

