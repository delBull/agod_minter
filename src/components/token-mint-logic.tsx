"use client";

import { toast } from "sonner";
import { useActiveAccount, useSendTransaction, useReadContract, useActiveWalletChain } from "thirdweb/react";
import { getContract } from "thirdweb/contract";
import type { ThirdwebContract } from "thirdweb";
import { baseChain } from "@/lib/chains";
import { client } from "@/lib/thirdwebClient";

const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const PRICE_PER_TOKEN = BigInt(7000); // 0.007 USDC

// Definir los tipos
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
    const { mutate: sendTransaction, isPending } = useSendTransaction();
    const currentChain = useActiveWalletChain();

    const handleMint = async () => {
        if (!account?.address) {
            toast.error("Por favor conecta tu wallet", toastStyle);
            return;
        }

        if (!currentChain || currentChain.id !== baseChain.id) {
            toast.error("Por favor cambia a la red correcta (Base Mainnet)", toastStyle);
            return;
        }

        try {
            props.setTransactionStep(1);
            props.setShowTransactionStatus(true);

            // Verificar el contrato
            if (!props.contract || !props.contract.address) {
                toast.error("Contrato no válido", toastStyle);
                return;
            }

            // Verificar la cantidad
            if (!props.quantity || props.quantity <= 0) {
                toast.error("Cantidad inválida para mintear", toastStyle);
                return;
            }

            // Preparar la transacción de minteo
            const mintTx = {
                contract: props.contract,
                method: "claim",
                params: [
                    account.address,
                    props.quantity,
                    USDC_ADDRESS,
                    PRICE_PER_TOKEN,
                    {
                        proof: ["0x0000000000000000000000000000000000000000000000000000000000000000"],
                        quantityLimitPerWallet: BigInt("100000000000000000000000000"),
                        pricePerToken: PRICE_PER_TOKEN,
                        currency: USDC_ADDRESS
                    }
                ],
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
                    toast.success("Transacción enviada, esperando confirmación...", toastStyle);
                    
                    await new Promise(r => setTimeout(r, 15000));
                    
                    props.setTransactionStep(3);
                    toast.success("¡Tokens minteados exitosamente! 💰", toastStyle);
                    await props.updateBalance();
                    
                    setTimeout(() => {
                        props.setShowTransactionStatus(false);
                        props.setTransactionStep(-1);
                    }, 3000);
                },
                onError: (error) => {
                    console.error("Error en minteo:", error);
                    toast.error("Error en el minteo. Por favor, intenta de nuevo.", toastStyle);
                    props.setShowTransactionStatus(false);
                    props.setTransactionStep(-1);
                }
            });
        } catch (error) {
            console.error("Error completo:", error);
            toast.error("Error inesperado durante el minteo", toastStyle);
            props.setShowTransactionStatus(false);
            props.setTransactionStep(-1);
        }
    };

    return {
        handleMint,
        isPending
    };
};

