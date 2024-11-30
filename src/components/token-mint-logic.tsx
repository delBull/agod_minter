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
const TOAST_DURATION = 8000;
const WAIT_DURATION = 10000; // 10 segundos de espera para confirmaciones

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
        duration: TOAST_DURATION,
    };

    if (type === 'error') {
        toast.error(message, options);
    } else {
        toast.success(message, options);
    }
};

// Definir los tipos para la estructura del contrato
interface AllowlistProof {
    proof: readonly `0x${string}`[];
    quantityLimitPerWallet: bigint;
    pricePerToken: bigint;
    currency: string;
}

interface ClaimParams {
    receiver: string;
    quantity: bigint;
    currency: string;
    pricePerToken: bigint;
    allowlistProof: AllowlistProof;
}

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
            console.log("Iniciando proceso de minteo...");
            console.log("Cuenta:", account.address);
            console.log("Cantidad:", props.quantity);

            const token = await props.verifyHuman();
            if (!token) {
                showToast("Error en la verificación de seguridad", "error");
                return;
            }

            const totalAmount = BigInt(Math.floor(PRICE_PER_TOKEN * props.quantity * Math.pow(10, DECIMALS)));
            const currentAllowance = BigInt(allowanceData?.toString() || "0");

            console.log("Verificación de allowance:", {
                totalAmount: totalAmount.toString(),
                currentAllowance: currentAllowance.toString(),
                needsApproval: currentAllowance < totalAmount
            });

            if (currentAllowance < totalAmount) {
                props.setTransactionStep(0);
                props.setShowTransactionStatus(true);

                try {
                    console.log("Preparando transacción de aprobación...");
                    const approvalTx = await prepareContractCall({
                        contract: usdcContract,
                        method: "function approve(address spender, uint256 amount)",
                        params: [props.contract.address, totalAmount]
                    });

                    console.log("Transacción de aprobación preparada:", approvalTx);
                    showToast("Esperando aprobación en MetaMask...");
                    
                    await sendTransaction(approvalTx);
                    console.log("Aprobación enviada");
                    showToast("Aprobación enviada, esperando confirmación...");
                    props.setTransactionStep(1);
                    
                    console.log("Esperando confirmación...");
                    await new Promise(resolve => setTimeout(resolve, WAIT_DURATION));
                    console.log("Procediendo con el minteo...");
                    await handleMintAfterApproval();
                } catch (error: any) {
                    console.error("Error en aprobación:", error);
                    handleTransactionError(error, "aprobación");
                }
                return;
            }

            await handleMintAfterApproval();
        } catch (error: any) {
            console.error("Error en proceso:", error);
            handleTransactionError(error, "proceso");
        }
    };

    const handleMintAfterApproval = async () => {
        if (!account?.address) return;

        props.setTransactionStep(2);
        showToast("Iniciando minteo...", "success");

        try {
            console.log("Preparando transacción de minteo...");
            
            // Usar la cantidad del input del usuario
            const mintAmount = BigInt(props.quantity) * BigInt("1000000000000000000"); // 18 decimales
            const pricePerToken = BigInt(7000); // 0.007 USDC con 6 decimales

            // Preparar los parámetros según la estructura del contrato
            const allowlistProof: AllowlistProof = {
                proof: ["0x0000000000000000000000000000000000000000000000000000000000000000"] as readonly `0x${string}`[],
                quantityLimitPerWallet: BigInt("100000000000000000000000000"),
                pricePerToken,
                currency: USDC_ADDRESS
            };

            const claimParams: ClaimParams = {
                receiver: account.address,
                quantity: mintAmount,
                currency: USDC_ADDRESS,
                pricePerToken,
                allowlistProof
            };

            console.log("Parámetros de minteo:", {
                ...claimParams,
                quantity: claimParams.quantity.toString(),
                pricePerToken: claimParams.pricePerToken.toString(),
                allowlistProof: {
                    ...claimParams.allowlistProof,
                    quantityLimitPerWallet: claimParams.allowlistProof.quantityLimitPerWallet.toString(),
                    pricePerToken: claimParams.allowlistProof.pricePerToken.toString()
                }
            });

            const mintTx = await prepareContractCall({
                contract: props.contract,
                method: {
                    name: "claim",
                    type: "function" as const,
                    inputs: [
                        { type: "address", name: "_receiver" },
                        { type: "uint256", name: "_quantity" },
                        { type: "address", name: "_currency" },
                        { type: "uint256", name: "_pricePerToken" },
                        {
                            type: "tuple",
                            name: "_allowlistProof",
                            components: [
                                { type: "bytes32[]", name: "proof" },
                                { type: "uint256", name: "quantityLimitPerWallet" },
                                { type: "uint256", name: "pricePerToken" },
                                { type: "address", name: "currency" }
                            ]
                        }
                    ],
                    outputs: [],
                    stateMutability: "payable" as const
                },
                params: [
                    claimParams.receiver,
                    claimParams.quantity,
                    claimParams.currency,
                    claimParams.pricePerToken,
                    claimParams.allowlistProof
                ]
            });

            console.log("Transacción de minteo preparada:", {
                to: mintTx.to,
                data: mintTx.data
            });

            await sendTransaction(mintTx);
            console.log("Minteo enviado");
            showToast("Transacción enviada, esperando confirmación en la blockchain...");
            
            await new Promise(resolve => setTimeout(resolve, WAIT_DURATION));
            
            props.setTransactionStep(3);
            showToast("¡Tokens minteados exitosamente!");
            console.log("Actualizando balance...");
            await props.updateBalance();
            setTimeout(() => {
                props.setShowTransactionStatus(false);
            }, TOAST_DURATION);
        } catch (error: any) {
            console.error("Error en minteo:", {
                error,
                message: error?.message,
                data: error?.data
            });
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

