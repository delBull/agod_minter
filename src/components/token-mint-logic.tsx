"use client";

import { toast } from "sonner";
import { useActiveAccount, useSendTransaction, useReadContract, useActiveWalletChain } from "thirdweb/react";
import { getContract } from "thirdweb/contract";
import type { ThirdwebContract } from "thirdweb";
import { baseChain } from "@/lib/chains";
import { client } from "@/lib/thirdwebClient";

const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const options = {
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

    // Usar toast.success o toast.error directamente con el estilo personalizado
    if (type === 'error') {
        toast.error(message, options);
    } else {
        toast.success(message, options);
    }
};

const TRANSACTION_WAIT = 3000;
const SUCCESS_DISPLAY = 2000;

export type TransactionStep = -1 | 0 | 1 | 2 | 3;

interface Props {
    contract: any;
    setTransactionStep: (step: TransactionStep) => void;
    setShowTransactionStatus: (show: boolean) => void;
    quantity: number;
    updateBalance: () => Promise<void>;
}

interface ContractError extends Error {
    code?: number;
    data?: any;
}

const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const PRICE_PER_TOKEN = BigInt(7000); // 0.007 USDC

export const useTokenMintLogic = (props: Props) => {
    const account = useActiveAccount();
    const { mutate: sendTransaction, isPending } = useSendTransaction();
    const currentChain = useActiveWalletChain();

    const handleMint = async () => {
        if (!account?.address) {
            showToast("Por favor conecta tu wallet", "error");
            return;
        }

        try {
            props.setTransactionStep(1);
            props.setShowTransactionStatus(true);

            // Preparar la transacción de minteo
            const mintTx = {
                contract: props.contract,
                method: "claim",
                params: [account.address, props.quantity.toString()], // Asegurarnos de pasar los parámetros correctos
                chain: baseChain,
                client
            };

            console.log("Preparando transacción:", {
                address: account.address,
                quantity: props.quantity,
                chainId: baseChain.id,
                contractAddress: props.contract.address,
                method: mintTx.method,
                params: mintTx.params
            });

            await sendTransaction(mintTx, {
                onSuccess: async () => {
                    props.setTransactionStep(2);
                    showToast("Transacción enviada, esperando confirmación...");
                    
                    await new Promise(r => setTimeout(r, 15000));
                    
                    props.setTransactionStep(3);
                    showToast("¡Tokens minteados exitosamente! 💰");
                    await props.updateBalance();
                    
                    setTimeout(() => {
                        props.setShowTransactionStatus(false);
                        props.setTransactionStep(-1);
                    }, 3000);
                },
                onError: (error) => {
                    console.error("Error en minteo:", error);
                    showToast("Error en el minteo. Por favor, intenta de nuevo.", "error");
                    props.setShowTransactionStatus(false);
                    props.setTransactionStep(-1);
                }
            });
        } catch (error) {
            console.error("Error completo:", error);
            showToast("Error inesperado durante el minteo", "error");
            props.setShowTransactionStatus(false);
            props.setTransactionStep(-1);
        }
    };

    return {
        handleMint,
        isPending
    };
};

