"use client";

import { useState } from "react";
import type { ThirdwebContract } from "thirdweb";
import {
    useActiveAccount,
    useSendTransaction,
    useActiveWallet,
    useSwitchActiveWalletChain,
    useActiveWalletChain
} from "thirdweb/react";
import { client } from "@/lib/thirdwebClient"; // Asumiendo que el archivo está en la carpeta lib
import { getContract } from "thirdweb/contract";
import { balanceOf, allowance } from "thirdweb/extensions/erc20";
import { claimTo } from "thirdweb/extensions/erc20";
import { toast } from "sonner";
import { baseChain } from "@/lib/chains";
import { getRpcClient } from "thirdweb/rpc";

const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const enhancedToastStyle = {
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

    if (type === 'success') {
        toast.success(message, enhancedToastStyle);
    } else {
        toast.error(message, enhancedToastStyle);
    }
};

type Props = {
    contract: ThirdwebContract;
    account: any;
    sendTransaction: any;
    isPending: boolean;
    setTransactionStep: (step: TransactionStep) => void;
    setShowTransactionStatus: (show: boolean) => void;
    quantity: number;
    isRecaptchaReady: boolean;
    verifyHuman: () => Promise<string | null>;
    updateBalance: () => Promise<void>;
};

interface MintError extends Error {
    message: string;
    code?: string;
    data?: any;
}

const APPROVAL_AMOUNT = BigInt("1000000000"); // 1000 USDC fijo para aprobación
const APPROVAL_TIMEOUT = 180000; // 3 minutos
const MIN_QUANTITY = 1;
const MAX_QUANTITY = 1000000; // Ajustar según tus necesidades

interface TransactionReceipt {
    status: `0x${string}`;
    blockNumber: `0x${string}`;
    gasUsed: `0x${string}`;
}

interface TransactionResult {
    hash: string;
    [key: string]: any;
}

export type TransactionStep = -1 | 0 | 1 | 2 | 3;

export const useTokenMintLogic = (props: Props) => {
    const account = useActiveAccount();
    const { mutate: sendTransaction, isPending } = useSendTransaction();
    const activeWallet = useActiveWallet();
    const switchChain = useSwitchActiveWalletChain();
    const currentChain = useActiveWalletChain();
    const [isChangingChain, setIsChangingChain] = useState(false);

    const waitForTransactionReceipt = async (
        txHash: `0x${string}` | undefined,
        maxAttempts: number = 10,
        delayMs: number = 3000
    ): Promise<boolean> => {
        if (!txHash) {
            console.error("Hash de transacción no proporcionado");
            return false;
        }

        const rpcClient = getRpcClient({
            client,
            chain: baseChain
        });

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            try {
                console.log(`Verificando recibo de transacción ${txHash} (intento ${attempt + 1}/${maxAttempts})...`);
                
                const receipt = await rpcClient({
                    method: "eth_getTransactionReceipt",
                    params: [txHash] // txHash ya es 0x{string}
                }) as TransactionReceipt | null;

                if (receipt) {
                    const status = receipt.status === "0x1";
                    console.log("Recibo de transacción:", {
                        hash: txHash,
                        status,
                        blockNumber: parseInt(receipt.blockNumber, 16),
                        gasUsed: parseInt(receipt.gasUsed, 16)
                    });
                    return status;
                }

                console.log(`Transacción ${txHash} aún no minada, esperando ${delayMs/1000} segundos...`);
                await new Promise(resolve => setTimeout(resolve, delayMs));
            } catch (error) {
                console.error(`Error verificando recibo de ${txHash}:`, error);
                if (attempt === maxAttempts - 1) return false;
                await new Promise(resolve => setTimeout(resolve, delayMs));
            }
        }

        return false;
    };

    const waitForApprovalConfirmation = async (
        usdcContract: any,
        owner: string,
        spender: string,
        expectedAmount: bigint,
        txHash: string
    ): Promise<boolean> => {
        const timeoutPromise = new Promise<boolean>((_, reject) => 
            setTimeout(() => reject(new Error("Timeout esperando aprobación")), APPROVAL_TIMEOUT)
        );

        try {
            return await Promise.race([
                (async () => {
                    const formattedHash = txHash.startsWith('0x') ? 
                        txHash as `0x${string}` : 
                        `0x${txHash}` as `0x${string}`;

                    const isConfirmed = await waitForTransactionReceipt(formattedHash);
                    if (!isConfirmed) {
                        console.error("La transacción de aprobación falló o expiró");
                        return false;
                    }

                    // Verificar allowance con reintentos
                    for (let attempt = 1; attempt <= 5; attempt++) {
                        const currentAllowance = await allowance({
                            contract: usdcContract,
                            spender,
                            owner
                        });

                        console.log(`Verificación de allowance (intento ${attempt}/5):`, {
                            currentAllowance: currentAllowance.toString(),
                            expectedAmount: expectedAmount.toString(),
                            approved: currentAllowance >= expectedAmount
                        });

                        if (currentAllowance >= expectedAmount) {
                            return true;
                        }

                        if (attempt < 5) {
                            await new Promise(r => setTimeout(r, 5000));
                        }
                    }
                    return false;
                })(),
                timeoutPromise
            ]);
        } catch (error) {
            console.error("Error en la confirmación de aprobación:", error);
            return false;
        }
    };

    const handleMint = async () => {
        try {
            // Validaciones iniciales mejoradas
            if (!account) {
                showToast("Por favor conecta tu wallet primero", "error");
                return;
            }

            if (!props.isRecaptchaReady) {
                showToast("El sistema de seguridad se está inicializando", "error");
                return;
            }

            if (props.quantity < MIN_QUANTITY || props.quantity > MAX_QUANTITY) {
                showToast(`La cantidad debe estar entre ${MIN_QUANTITY} y ${MAX_QUANTITY}`, "error");
                return;
            }

            // Verificación de red mejorada
            if (!currentChain || currentChain.id !== baseChain.id) {
                showToast("Por favor, conecta tu wallet a la red Base", "error");
                try {
                    await switchChain(baseChain);
                    await new Promise(resolve => setTimeout(resolve, 2000));
                } catch (error) {
                    console.error("Error switching chain:", error);
                    showToast("Error al cambiar de red. Por favor, inténtalo manualmente.", "error");
                    props.setShowTransactionStatus(false);
                    props.setTransactionStep(-1);
                    return;
                }
            }

            // Verify human interaction first
            const token = await props.verifyHuman();
            if (!token) {
                showToast("Error en la verificación de seguridad. Por favor, inténtalo de nuevo.", "error");
                return;
            }

            props.setShowTransactionStatus(true);
            props.setTransactionStep(0);

            const usdcContract = getContract({
                client,
                address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
                chain: baseChain
            });

            const PRICE_PER_TOKEN = 0.007;
            const DECIMALS = 6;
            const pricePerTokenInBaseUnits = BigInt(Math.floor(PRICE_PER_TOKEN * Math.pow(10, DECIMALS)));
            const totalAmount = pricePerTokenInBaseUnits * BigInt(props.quantity);

            // Verificar balance y allowance
            const [usdcBalance, currentAllowance] = await Promise.all([
                balanceOf({
                    contract: usdcContract,
                    address: account.address
                }),
                allowance({
                    contract: usdcContract,
                    spender: props.contract.address,
                    owner: account.address
                })
            ]);

            if (usdcBalance < totalAmount) {
                const requiredUSDC = Number(totalAmount) / Math.pow(10, DECIMALS);
                showToast(`Necesitas ${requiredUSDC.toFixed(3)} USDC para mintear`, "error");
                props.setShowTransactionStatus(false);
                props.setTransactionStep(-1);
                return;
            }

            // Mejorar el manejo de la aprobación
            if (currentAllowance < totalAmount) {
                console.log("Iniciando proceso de aprobación:", {
                    currentAllowance: currentAllowance.toString(),
                    requiredAmount: totalAmount.toString(),
                    approvalAmount: APPROVAL_AMOUNT.toString()
                });

                props.setTransactionStep(0);
                props.setShowTransactionStatus(true);

                // Asegurarnos de que tenemos la cuenta conectada
                if (!account?.address) {
                    showToast("Error: No se pudo conectar la cuenta", "error");
                    props.setShowTransactionStatus(false);
                    props.setTransactionStep(-1);
                    return;
                }

                const approvalTx = {
                    contract: usdcContract,
                    functionName: "approve",
                    args: [props.contract.address, APPROVAL_AMOUNT],
                    chain: baseChain,
                    client: client,
                    account: account.address, // Especificar explícitamente la cuenta
                };

                try {
                    console.log("Iniciando aprobación desde cuenta:", account.address);
                    await props.sendTransaction(approvalTx, {
                        onSuccess: async (result: TransactionResult) => {
                            if (!result?.hash) {
                                console.error("No se recibió hash de transacción");
                                showToast("Error: No se pudo confirmar la transacción", "error");
                                props.setShowTransactionStatus(false);
                                props.setTransactionStep(-1);
                                return;
                            }

                            const txHash = result.hash.startsWith('0x') ? 
                                result.hash as `0x${string}` : 
                                `0x${result.hash}` as `0x${string}`;

                            console.log("Aprobación iniciada:", {
                                hash: txHash,
                                amount: APPROVAL_AMOUNT.toString(),
                                from: account.address,
                                to: props.contract.address
                            });
                            props.setTransactionStep(1);
                            
                            const isApproved = await waitForApprovalConfirmation(
                                usdcContract,
                                account.address,
                                props.contract.address,
                                totalAmount,
                                txHash
                            );

                            if (isApproved) {
                                console.log("Aprobación confirmada, procediendo con el minteo");
                                await handleMintAfterApproval(account.address);
                            } else {
                                console.error("La aprobación no se confirmó");
                                showToast("Error: La aprobación no se confirmó. Por favor, intenta de nuevo.", "error");
                                props.setShowTransactionStatus(false);
                                props.setTransactionStep(-1);
                            }
                        },
                        onError: (error: unknown) => handleApprovalError(error as MintError)
                    });
                } catch (error: unknown) {
                    handleApprovalError(error as MintError);
                }
            } else {
                console.log('Allowance existente suficiente:', currentAllowance.toString());
                props.setTransactionStep(1);
                props.setShowTransactionStatus(true);
                await handleMintAfterApproval(account.address);
            }
        } catch (error) {
            console.error("Error inesperado en handleMint:", error);
            showToast("Error inesperado. Por favor, intenta de nuevo.", "error");
            props.setShowTransactionStatus(false);
            props.setTransactionStep(-1);
        }
    };

    const handleMintAfterApproval = async (accountAddress: string) => {
        try {
            console.log("Iniciando minteo para:", accountAddress);
            
            const transaction = claimTo({
                contract: props.contract,
                to: accountAddress,
                quantity: String(props.quantity),
            });

            await props.sendTransaction(transaction, {
                onSuccess: () => {
                    props.setTransactionStep(2);
                    setTimeout(() => {
                        props.setTransactionStep(3);
                        showToast("¡Tokens minteados exitosamente!");
                        props.updateBalance();
                        props.setShowTransactionStatus(false);
                    }, 2000);
                },
                onError: (error: MintError) => {
                    handleMintError(error);
                }
            });
        } catch (error) {
            handleMintError(error as MintError);
        }
    };

    const handleMintError = (error: MintError) => {
        console.error("Error en el minteo:", error);
        if (error.message?.includes("user rejected")) {
            showToast("Transacción cancelada por el usuario", "error");
        } else if (error.message?.includes("insufficient funds")) {
            showToast("USDC insuficiente para el minteo", "error");
        } else if (error.message?.includes("exceeds allowance")) {
            showToast("Error de aprobación. Por favor, intenta de nuevo.", "error");
        } else {
            showToast("Error en el minteo. Por favor, inténtalo de nuevo.", "error");
        }
        props.setShowTransactionStatus(false);
        props.setTransactionStep(-1);
    };

    const handleApprovalError = (error: MintError) => {
        console.error("Error en aprobación:", error);
        if (error.message?.includes("user rejected")) {
            showToast("Aprobación cancelada por el usuario", "error");
        } else if (error.message?.includes("insufficient funds")) {
            showToast("Balance insuficiente para la aprobación", "error");
        } else {
            showToast("Error en la aprobación de USDC", "error");
        }
        props.setShowTransactionStatus(false);
        props.setTransactionStep(-1);
    };

    return {
        handleMint,
        handleMintAfterApproval,
        isChangingChain,
        isPending
    };
};

