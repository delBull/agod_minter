"use client";

import {
    useActiveAccount,
    useSendTransaction,
    useReadContract,
    useActiveWalletChain
} from "thirdweb/react";
import { getContract } from "thirdweb/contract";
import { prepareContractCall } from "thirdweb";
import type { ThirdwebContract } from "thirdweb";
import { baseChain } from "@/lib/chains";
import { client } from "@/lib/thirdwebClient";
import { toast } from "sonner";

const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const PRICE_PER_TOKEN = 0.007;
const DECIMALS = 6;

export type TransactionStep = -1 | 0 | 1 | 2 | 3;

type Props = {
    contract: ThirdwebContract;
    setTransactionStep: (step: TransactionStep) => void;
    setShowTransactionStatus: (show: boolean) => void;
    quantity: number;
    isRecaptchaReady: boolean;
    verifyHuman: () => Promise<string | null>;
    updateBalance: () => Promise<void>;
};

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

    if (type === 'error') {
        toast.error(message, options);
    } else {
        toast.success(message, options);
    }
};

export const useTokenMintLogic = (props: Props) => {
    const account = useActiveAccount();
    const { mutate: sendTransaction, isPending } = useSendTransaction();
    const currentChain = useActiveWalletChain();

    // Obtener los contratos
    const usdcContract = getContract({
        client,
        address: USDC_ADDRESS,
        chain: baseChain
    });

    // Verificar allowance de USDC
    const { data: allowanceData } = useReadContract({
        contract: usdcContract,
        method: "allowance",
        params: account?.address ? [account.address, props.contract.address] : []
    });

    const handleMint = async () => {
        if (!account?.address) {
            showToast("Por favor conecta tu wallet primero", "error");
            return;
        }

        if (!currentChain || currentChain.id !== baseChain.id) {
            showToast("Por favor, cambia a la red Base", "error");
            return;
        }

        try {
            const token = await props.verifyHuman();
            if (!token) {
                showToast("Error en la verificación de seguridad", "error");
                return;
            }

            const totalAmount = BigInt(Math.floor(PRICE_PER_TOKEN * props.quantity * Math.pow(10, DECIMALS)));
            const currentAllowance = BigInt(allowanceData?.toString() || "0");

            if (currentAllowance < totalAmount) {
                props.setTransactionStep(0);
                props.setShowTransactionStatus(true);

                try {
                    // Preparar la transacción de aprobación
                    const approvalTx = await prepareContractCall({
                        contract: usdcContract,
                        method: "function approve(address spender, uint256 amount)",
                        params: [props.contract.address, totalAmount]
                    });

                    await sendTransaction(approvalTx);
                    showToast("Aprobación exitosa");
                    props.setTransactionStep(1);
                    await handleMintAfterApproval();
                } catch (error: any) {
                    handleTransactionError(error, "aprobación");
                }
                return;
            }

            await handleMintAfterApproval();
        } catch (error: any) {
            handleTransactionError(error, "proceso");
        }
    };

    const handleMintAfterApproval = async () => {
        if (!account?.address) return;

        props.setTransactionStep(2);
        showToast("Iniciando minteo...");

        try {
            // Preparar la transacción de minteo
            const mintTx = await prepareContractCall({
                contract: props.contract,
                method: "function claim(address receiver, uint256 quantity)",
                params: [account.address, BigInt(props.quantity)]
            });

            await sendTransaction(mintTx);
            props.setTransactionStep(3);
            showToast("¡Tokens minteados exitosamente!");
            props.updateBalance();
            props.setShowTransactionStatus(false);
        } catch (error: any) {
            handleTransactionError(error, "minteo");
        }
    };

    const handleTransactionError = (error: any, context: string) => {
        console.error(`Error en ${context}:`, error);
        
        let message = "Error inesperado";
        
        if (error?.message) {
            if (error.message.includes("user rejected")) {
                message = "Transacción rechazada por el usuario";
            } else if (error.message.includes("insufficient funds")) {
                message = "Balance insuficiente para gas";
            } else if (error.message.includes("Internal JSON-RPC error")) {
                message = "Error de conexión con la red. Por favor, intenta de nuevo.";
            } else {
                message = `Error en ${context}. Por favor, intenta de nuevo.`;
            }
        }

        showToast(message, "error");
        props.setShowTransactionStatus(false);
        props.setTransactionStep(-1);
    };

    return {
        handleMint,
        isPending
    };
};

