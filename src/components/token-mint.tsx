"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Minus, Plus, Coins } from "lucide-react";
import { useTheme } from "next-themes";
import type { ThirdwebContract } from "thirdweb";
import {
    useActiveAccount,
    ConnectButton,
    useSendTransaction,
    useActiveWallet,
    darkTheme,
    useSwitchActiveWalletChain,
    useActiveWalletChain,
    useReadContract
} from "thirdweb/react";
import { client } from "@/lib/thirdwebClient";
import { createWallet, inAppWallet } from "thirdweb/wallets";
import { getContract } from "thirdweb/contract";
import { balanceOf, allowance } from "thirdweb/extensions/erc20";
import React from "react";
import { toast } from "sonner";
import { useSpring, animated } from "react-spring";
import CountUp from "react-countup";
import { claimTo } from "thirdweb/extensions/erc20";
import { Button } from "@/components/ui/button";
import { baseChain } from "@/lib/chains";
import { TransactionStatus } from "./transaction-status";
import { useReCaptcha } from "../hooks/use-recaptcha";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

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
    const formatted = balance / 1e18;
    return formatted.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
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
        <div className="relative my-4">
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
        const value = e.target.value;
        if (value === "") {
            setQuantity(0);
        } else {
            const numValue = Number.parseInt(value);
            if (!Number.isNaN(numValue)) {
                setQuantity(Math.max(0, numValue));
            }
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
            showToast("Por favor conecta tu wallet primero", "error");
            return;
        }

        try {
            if (!currentChain || currentChain.id !== baseChain.id) {
                await switchChain(baseChain);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

            const usdcContract = getContract({
                client,
                address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
                chain: baseChain
            });

            const PRICE_PER_TOKEN = 0.007;
            const DECIMALS = 6;
            const pricePerTokenInBaseUnits = BigInt(Math.floor(PRICE_PER_TOKEN * Math.pow(10, DECIMALS)));
            const totalAmount = pricePerTokenInBaseUnits * BigInt(quantity);

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
                return;
            }

            // Si necesitamos aprobación
            if (currentAllowance < totalAmount) {
                setTransactionStep(0);
                setShowTransactionStatus(true);

                const approvalTx = {
                    contract: usdcContract,
                    functionName: "approve",
                    args: [props.contract.address, totalAmount * BigInt(100)],
                    chain: baseChain,
                    client: client
                };

                try {
                    await sendTransaction(approvalTx, {
                        onSuccess: async () => {
                            console.log("Aprobación iniciada");
                            setTransactionStep(1);
                            
                            // Esperamos un tiempo fijo antes de mintear
                            await new Promise(wait => setTimeout(wait, 15000));
                            
                            try {
                                const finalAllowance = await allowance({
                                    contract: usdcContract,
                                    spender: props.contract.address,
                                    owner: account.address
                                });

                                console.log('Allowance final:', finalAllowance.toString());
                                console.log('Amount necesario:', totalAmount.toString());

                                if (finalAllowance >= totalAmount) {
                                    await handleMintAfterApproval(account.address);
                                } else {
                                    showToast("Error en la aprobación. Por favor, intenta de nuevo.", "error");
                                    resetTransactionStatus();
                                }
                            } catch (error) {
                                console.error("Error en verificación final:", error);
                                showToast("Error verificando la aprobación", "error");
                                resetTransactionStatus();
                            }
                        },
                        onError: (error) => {
                            console.error("Error en aprobación:", error);
                            showToast("Error en la aprobación de USDC", "error");
                            resetTransactionStatus();
                        }
                    });
                } catch (error) {
                    console.error("Error en aprobación:", error);
                    showToast("Error en la aprobación de USDC", "error");
                    resetTransactionStatus();
                    return;
                }
            } else {
                setTransactionStep(1);
                setShowTransactionStatus(true);
                await handleMintAfterApproval(account.address);
            }

        } catch (error: any) {
            console.error("Error general:", error);
            showToast("Error inesperado. Por favor, inténtalo de nuevo.", "error");
            resetTransactionStatus();
        }
    };

    const handleMintAfterApproval = async (accountAddress: string) => {
        try {
            console.log("Iniciando minteo para:", accountAddress);
            const transaction = claimTo({
                contract: props.contract,
                to: accountAddress,
                quantity: String(quantity),
            });

            console.log("Transacción preparada:", transaction);

            await sendTransaction(transaction, {
                onSuccess: () => {
                    setTransactionStep(2);
                    setTimeout(() => {
                        setTransactionStep(3);
                        showToast("¡Tokens minteados exitosamente!");
                        updateBalance();
                        resetTransactionStatus();
                    }, 2000);
                },
                onError: (error) => {
                    console.error("Error detallado del minteo:", error);
                    showToast("Error en el minteo. Por favor, inténtalo de nuevo.", "error");
                    resetTransactionStatus();
                }
            });
        } catch (error) {
            console.error("Error preparando minteo:", error);
            showToast("Error preparando el minteo", "error");
            resetTransactionStatus();
        }
    };

    const handleAddToWallet = async () => {
        try {
            if (!window.ethereum) {
                showToast("Por favor instala MetaMask", "error");
                return;
            }

            const tokenAddress = props.contract.address;
            const tokenSymbol = "AGOD";
            const tokenDecimals = 18;
            const tokenImage = props.contractImage;

            const wasAdded = await window.ethereum.request({
                method: 'wallet_watchAsset',
                params: [{
                    type: 'ERC20',
                    options: {
                        address: tokenAddress,
                        symbol: tokenSymbol,
                        decimals: tokenDecimals,
                        image: tokenImage,
                    },
                }]
            });

            if (wasAdded) {
                showToast("¡AGOD Token añadido a tu wallet!");
            }
        } catch (error) {
            console.error("Error añadiendo token:", error);
            showToast("Error al añadir el token", "error");
        }
    };

    if (props.pricePerToken === null || props.pricePerToken === undefined) {
        console.error("Invalid pricePerToken");
        return null;
    }

    return (
        <div className="flex flex-col items-center justify-center">
            {!account ? (
                <div className="flex flex-col items-center justify-center">
                    <StyledConnectButton />
                </div>
            ) : (
                <div className="-mt-8 sm:mt-0">
                    <Card className="w-full max-w-sm md:max-w-xl p-4 sm:p-8 animate-fadeIn mx-4 sm:mx-0 -mt-12 md:-mt-5">
                        <CardContent className="flex flex-col items-center justify-center">
                            <h2 className="text-xl sm:text-2xl font-bold mb-2 text-zinc-100">
                                {props.displayName}
                            </h2>
                            <p className="text-sm sm:text-base text-zinc-300 mb-4 sm:mb-8 text-center">
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
                                        AGOD Token está en la red Base, <br />conctate a ella para mintear.
                                    </div>
                                    <div className="flex items-center">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={decreaseQuantity}
                                            disabled={quantity <= 0}
                                            className="rounded-r-none border-zinc-800"
                                        >
                                            <Minus className="h-4 w-4" />
                                        </Button>

                                        <Input
                                            type="text"
                                            value={quantity === 0 ? "" : quantity}
                                            onChange={handleQuantityChange}
                                            className="w-28 text-center text-white font-mono rounded-none border-x-0 pl-6 border-zinc-800 bg-transparent"
                                            placeholder="0"
                                            onFocus={(e) => e.target.select()}
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
                                            end={0.007 * quantity}
                                            decimals={3}
                                            separator=","
                                            decimal="."
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
                            <div className="flex items-center gap-2 w-full sm:w-96 px-2 sm:px-0">
                                <Button
                                    variant="gradient"
                                    className="flex-1 h-10 text-xs sm:text-sm"
                                    onClick={handleMint}
                                    disabled={isPending || isChangingChain || showTransactionStatus || !isRecaptchaReady}
                                >
                                    {isPending ? "Minting..." : 
                                    isChangingChain ? "Cambiando Red..." : 
                                    !isRecaptchaReady ? "Inicializando Seguridad..." :
                                    `Mint ${quantity} Token${quantity > 1 ? "s" : ""}`}
                                </Button>
                                
                                <div className="relative shrink-0">
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-md" />
                                    <TooltipProvider>
                                        <Tooltip delayDuration={100}>
                                            <TooltipTrigger asChild>
                                                <button
                                                    onClick={handleAddToWallet}
                                                    className="relative px-3 sm:px-4 h-10 rounded-md bg-transparent flex items-center gap-1 text-[10px] font-mono font-bold text-zinc-100 hover:text-zinc-200 transition-colors border border-transparent hover:border-zinc-700"
                                                >
                                                    <span>AGOD</span>
                                                    <Coins className="h-4 w-4" />
                                                </button>
                                            </TooltipTrigger>
                                            <TooltipContent className="bg-zinc-800 border-1 border-zinc-400 text-zinc-100 text-xs">
                                                <p>Agrega AGOD a tu Wallet</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            </div>

                            <div className="mt-4">
                                <StyledConnectButton />
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            )}
        </div>
    );
}