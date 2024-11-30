"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Minus, Plus } from "lucide-react";
import { useTheme } from "next-themes";
import type { ThirdwebContract } from "thirdweb";
import {
    useActiveAccount,
    ConnectButton,
    useSendTransaction,
    useActiveWallet,
    darkTheme,
    useSwitchActiveWalletChain,
    useActiveWalletChain
} from "thirdweb/react";
import { client } from "@/lib/thirdwebClient";
import { createWallet, inAppWallet } from "thirdweb/wallets";
import { getContract } from "thirdweb/contract";
import { balanceOf, approve } from "thirdweb/extensions/erc20";
import React from "react";
import { toast } from "sonner";
import { useSpring, animated } from "react-spring";
import CountUp from "react-countup";
import { claimTo } from "thirdweb/extensions/erc20";
import { Button } from "@/components/ui/button";
import { baseChain } from "@/lib/chains";
import { TransactionStatus } from "./transaction-status";
import { useReCaptcha } from "../hooks/use-recaptcha";
import { CountdownTimer } from "./countdown-timer";

// Enhanced toast styles with consistent gradient and styling
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

// Helper function to show consistent toast messages
const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    if (type === 'success') {
        toast.success(message, enhancedToastStyle);
    } else {
        toast.error(message, enhancedToastStyle);
    }
};

type Props = {
    contract: ThirdwebContract;
    displayName: string;
    description: string;
    contractImage: string;
    pricePerToken: number;
    currencySymbol: string;
    isERC20: boolean;
};

function formatBalance(balance: number): string {
    const formatted = balance.toString();
    // Asegurarse de que el número tenga al menos 18 dígitos agregando ceros a la izquierda
    const paddedNumber = formatted.padStart(19, '0');
    // Insertar el punto decimal 18 posiciones desde la derecha
    const withDecimal = paddedNumber.slice(0, -18) + '.' + paddedNumber.slice(-18);
    // Convertir a número y formatear para eliminar ceros innecesarios
    return parseFloat(withDecimal).toString();
}

function StyledConnectButton() {
    const wallets = [
        inAppWallet({
            auth: {
                options: [
                    "google",
                    "apple",
                    "discord",
                    "email",
                    "facebook",
                    "phone",
                ],
            },
        }),
        createWallet("io.metamask"),
        createWallet("com.coinbase.wallet"),
        createWallet("io.rabby"),
        createWallet("walletConnect"),
    ];

    const handleConnect = useCallback((wallet: any) => {
        console.log("%cWallet Connected", "color: green; font-weight: bold;");
        console.log("  Wallet:", wallet.id);
        console.log("  Chain:", wallet.getChain());
        showToast("¡Wallet conectada exitosamente!");
    }, []);

    return (
        <div className="relative mt-10 mb-10">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg opacity-50" />
            <div className="w-96 h-0 flex items-center justify-center bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-[1px] transition-colors">
                <div className="rounded-lg z-10">
                    <ConnectButton 
                        client={client}
                        wallets={wallets}
                        connectModal={{
                            title: "Conéctate con AGOD",
                            titleIcon: "/icon.png",
                            size: "compact",
                            showThirdwebBranding: false,
                        }}
                        theme={darkTheme({
                            colors: { accentText: "hsl(358, 67%, 54%)" },
                        })}
                        connectButton={{
                            label: "Inicia tu Conexión",
                            className: "bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity"
                        }}
                        locale="es_ES"
                        onConnect={handleConnect}
                    />
                </div>
            </div>
        </div>
    );
}

// Agregar interface para el error de Web3
interface Web3Error extends Error {
    code?: string | number;
    details?: any;
}

export function TokenMint(props: Props) {
    const [quantity, setQuantity] = useState(1);
    const { theme } = useTheme();
    const account = useActiveAccount();
    const { mutate: sendTransaction, isPending } = useSendTransaction();
    const [tokenBalance, setTokenBalance] = useState<number>(0);
    const activeWallet = useActiveWallet();
    const switchChain = useSwitchActiveWalletChain();
    const currentChain = useActiveWalletChain();
    const [isChangingChain, setIsChangingChain] = useState(false);
    const [transactionStep, setTransactionStep] = useState(-1);
    const [showTransactionStatus, setShowTransactionStatus] = useState(false);
    const { verifyHuman, isReady: isRecaptchaReady } = useReCaptcha();

    const updateBalance = async () => {
        if (account && props.contract) {
            try {
                const contract = getContract({
                    client,
                    address: props.contract.address,
                    chain: baseChain
                });

                const balance = await balanceOf({
                    contract,
                    address: account.address
                });

                if (balance) {
                    setTokenBalance(Number(balance));
                }
            } catch (error) {
                console.error("Error fetching balance:", error);
            }
        }
    };

    useEffect(() => {
        if (account) {
            console.log("%cAccount Connected", "color: green; font-weight: bold;");
            console.log("  Address:", account.address);
            updateBalance();
        } else {
            setTokenBalance(0);
        }
    }, [account, props.contract]);

    useEffect(() => {
        let intervalId: NodeJS.Timeout;
        
        if (account) {
            updateBalance();
            intervalId = setInterval(updateBalance, 5000);
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [account, props.contract]);

    useEffect(() => {
        let isHandlingSwitch = false;
        const handleChainSwitch = async () => {
            if (!activeWallet || !account || isChangingChain || isHandlingSwitch) return;

            try {
                if (!currentChain || currentChain.id !== baseChain.id) {
                    isHandlingSwitch = true;
                    setIsChangingChain(true);
                    await switchChain(baseChain);
                    showToast("¡Red cambiada exitosamente a Base Mainnet!");
                }
            } catch (error) {
                console.error("%cError switching chain", "color: red; font-weight: bold;", error);
                showToast("Error al cambiar de red. Por favor, inténtalo manualmente.", "error");
            } finally {
                setIsChangingChain(false);
                isHandlingSwitch = false;
            }
        };

        // Debounce para evitar múltiples llamadas
        const timeoutId = setTimeout(() => {
        handleChainSwitch();
        }, 500);

        return () => clearTimeout(timeoutId);
     }, [activeWallet, account, currentChain, switchChain]);
        
     if (isChangingChain) {
        showToast("Cambio de red en proceso, por favor espera...", "error");
        return;
    }

    const decreaseQuantity = () => {
        setQuantity((prev) => Math.max(1, prev - 1));
    };

    const increaseQuantity = () => {
        setQuantity((prev) => prev + 1);
    };

    const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number.parseInt(e.target.value);
        if (!Number.isNaN(value)) {
            setQuantity(Math.max(1, value));
        }
    };

    const resetTransactionStatus = () => {
        setTimeout(() => {
            setShowTransactionStatus(false);
            setTransactionStep(-1);
        }, 3000);
    };

    const handleMint = async () => {
        if (!account) {
            console.log("No hay cuenta conectada");
            showToast("Por favor conecta tu wallet primero", "error");
            return;
        }

        try {
            // Verificar explícitamente la cadena y el balance antes del minteo
            try {
                if (!currentChain) {
                    console.log("Estado actual de la cadena:", currentChain);
                    throw new Error("No se detectó la cadena");
                }

                // Verificar que estamos en Base
                if (currentChain.id !== baseChain.id) {
                    console.log("Cambio de cadena necesario:", {
                        actual: currentChain.id,
                        necesaria: baseChain.id
                    });
                    await switchChain(baseChain);
                    // Esperar un momento para que el cambio se complete
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }

                // Verificar el balance antes de mintear
                const contract = getContract({
                    client,
                    address: props.contract.address,
                    chain: baseChain
                });

                // Resto del código de minteo...
                setShowTransactionStatus(true);
                setTransactionStep(0);

                console.log("Iniciando transacción con:", {
                    contractAddress: props.contract.address,
                    userAddress: account.address,
                    quantity: quantity,
                    chain: currentChain
                });

                setTransactionStep(1);
                const transaction = claimTo({
                    contract: props.contract,
                    to: account.address,
                    quantity: String(quantity),
                });

                // Modificar el manejo de errores
                sendTransaction(transaction, {
                    onSuccess: () => {
                        setTransactionStep(2);
                        setTimeout(() => {
                            setTransactionStep(3);
                            console.log("%cMint successful", "color: green; font-weight: bold;");
                            // Show success toast only after transaction is fully completed
                            setTimeout(() => {
                                showToast("¡Tokens minteados exitosamente!");
                            }, 1000);
                            setTimeout(updateBalance, 2000);
                            resetTransactionStatus();
                        }, 2000);
                    },
                    onError: (error: Web3Error) => {
                        console.error("Error detallado:", {
                            message: error.message,
                            code: error.code || 'unknown',
                            details: error
                        });
                        
                        // Mensajes de error más específicos
                        if (error.message.includes("insufficient funds")) {
                            showToast("No hay suficientes fondos para cubrir el gas", "error");
                        } else if (error.message.includes("user rejected")) {
                            showToast("Transacción rechazada por el usuario", "error");
                        } else if (error.message.includes("network")) {
                            showToast("Error de conexión. Verifica tu red", "error");
                        } else {
                            showToast(`Error: ${error.message}`, "error");
                        }
                        resetTransactionStatus();
                    },
                });

            } catch (error) {
                console.error("Error en proceso de minteo:", error);
                // ... rest of error handling ...
            }

            // Obtener el contrato USDC
            const usdcContract = getContract({
                client,
                // Asegúrate de usar la dirección correcta del contrato USDC en Base
                address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC en Base
                chain: baseChain
            });

            // Calcular el monto total en USDC (cantidad * precio por token)
            const totalAmount = String(quantity * props.pricePerToken * 1e6); // USDC tiene 6 decimales

            console.log("Iniciando aprobación de USDC:", {
                amount: totalAmount,
                spender: props.contract.address
            });

            // Aprobar el gasto de USDC
            const approvalTx = approve({
                contract: usdcContract,
                spender: props.contract.address,
                amount: totalAmount
            });

            await sendTransaction(approvalTx, {
                onSuccess: async () => {
                    console.log("Aprobación exitosa, procediendo con el minteo");
                    showToast("Aprobación exitosa, iniciando minteo...");
                    
                    // Continuar con el minteo original
                    setShowTransactionStatus(true);
                    setTransactionStep(1);
                    
                    const transaction = claimTo({
                        contract: props.contract,
                        to: account.address,
                        quantity: String(quantity),
                    });

                    sendTransaction(transaction, {
                        onSuccess: () => {
                            setTransactionStep(2);
                            setTimeout(() => {
                                setTransactionStep(3);
                                showToast("¡Tokens minteados exitosamente!");
                                setTimeout(updateBalance, 2000);
                                resetTransactionStatus();
                            }, 2000);
                        },
                        onError: (error: Web3Error) => {
                            console.error("Error en minteo:", error);
                            showToast(`Error en minteo: ${error.message}`, "error");
                            resetTransactionStatus();
                        }
                    });
                },
                onError: (error: Web3Error) => {
                    console.error("Error en aprobación:", error);
                    showToast("Error al aprobar USDC. Por favor, inténtalo de nuevo.", "error");
                    resetTransactionStatus();
                }
            });

        } catch (error) {
            console.error("Error en proceso:", error);
            showToast("Error inesperado. Por favor, inténtalo de nuevo.", "error");
            resetTransactionStatus();
        }
    };

    if (props.pricePerToken === null || props.pricePerToken === undefined) {
        console.error("Invalid pricePerToken");
        return null;
    }

    if (!account) {
        return (
            <div className="flex flex-col items-center justify-center -mt-32">
                <CountdownTimer />
                <StyledConnectButton />
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center">
            <Card className="w-full max-w-xl p-8 animate-fadeIn">
                <CardContent className="flex flex-col items-center justify-center">
                    <h2 className="text-2xl font-bold mb-2 text-zinc-100">
                        {props.displayName}
                    </h2>
                    <p className="text-zinc-300 mb-8 text-center">
                        {props.description}
                    </p>

                    {showTransactionStatus ? (
                        <TransactionStatus 
                            currentStep={transactionStep} 
                            isVisible={showTransactionStatus} 
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center mb-4">
                            <div className="text-xs text-center font-medium font-mono text-zinc-400 mb-2">
                                AGOD Token está en la red Base, <br />conéctate a ella para mintear.
                            </div>
                            <div className="flex items-center">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={decreaseQuantity}
                                    disabled={quantity <= 1}
                                    className="rounded-r-none border-zinc-800"
                                >
                                    <Minus className="h-4 w-4" />
                                </Button>

                                <Input
                                    type="number"
                                    value={quantity}
                                    onChange={handleQuantityChange}
                                    className="w-28 text-center text-white font-mono rounded-none border-x-0 pl-6 border-zinc-800 bg-transparent"
                                    min="1"
                                />

                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={increaseQuantity}
                                    className="rounded-l-none border-zinc-800"
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="text-base pr-1 font-semibold text-zinc-100 mt-2">
                                    Total: <CountUp 
                                        end={props.pricePerToken * quantity} 
                                        decimals={1}  // Asegura que se muestren los decimales
                                    /> {props.currencySymbol}
                            </div>

                            <div className="text-xs pr-1 text-zinc-400 font-mono mt-1">
                                {tokenBalance > 0 
                                    ? `Tienes ${formatBalance(tokenBalance)} AGOD Tokens`
                                    : "Aún no tienes AGOD Tokens"}
                            </div>
                        </div>
                    )}
                </CardContent>

                <CardFooter className="flex flex-col items-center justify-center">
                    <div className="flex flex-col items-center justify-center w-full">
                    <Button
                        variant="gradient"
                        className="flex-1"
                        onClick={handleMint}
                        disabled={isPending || isChangingChain || showTransactionStatus || !isRecaptchaReady}
                        >
                        {isPending ? "Minting..." : 
                        isChangingChain ? "Cambiando Red..." : 
                        !isRecaptchaReady ? "Inicializando Seguridad..." :
                        `Mint ${quantity} Token${quantity > 1 ? "s" : ""}`}
                    </Button>
                        <StyledConnectButton />
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}

