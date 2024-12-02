"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Minus, Plus, Coins } from "lucide-react";
import type { ThirdwebContract } from "thirdweb";
import {
    useActiveAccount,
    ConnectButton,
    useActiveWallet,
    darkTheme,
    useSwitchActiveWalletChain,
    useActiveWalletChain,
    useSendTransaction
} from "thirdweb/react";
import { client } from "@/lib/thirdwebClient";
import { createWallet, inAppWallet } from "thirdweb/wallets";
import { getContract } from "thirdweb/contract";
import { balanceOf } from "thirdweb/extensions/erc20";
import { toast } from "sonner";
import CountUp from "react-countup";
import { Button } from "@/components/ui/button";
import { baseChain } from "@/lib/chains";
import { TransactionStatus } from "./transaction-status";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTokenMintLogic, TransactionStep } from './token-mint-logic';

// Definir las interfaces
interface Props {
    contract: ThirdwebContract;
    displayName: string;
    description: string;
    contractImage: string;
    pricePerToken: number;
    currencySymbol: string;
    isERC20: boolean;
}

interface AddTokenParams {
    address: string;
    symbol: string;
    decimals: number;
    image?: string;
}

// Función de formato
function formatBalance(balance: number): string {
    // Convertir a número entero usando Math.floor
    const formatted = Math.floor(balance / 1e18);
    return formatted.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
}

// Componente StyledConnectButton
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
                    />
                </div>
            </div>
        </div>
    );
}

export function TokenMint(props: Props) {
    const [quantity, setQuantity] = useState(1);
    const [tokenBalance, setTokenBalance] = useState<number>(0);
    const [transactionStep, setTransactionStep] = useState<TransactionStep>(-1);
    const [showTransactionStatus, setShowTransactionStatus] = useState(false);
    const [isChangingChain, setIsChangingChain] = useState(false);
    
    const account = useActiveAccount();
    const activeWallet = useActiveWallet();
    const switchChain = useSwitchActiveWalletChain();
    const currentChain = useActiveWalletChain();

    const { mutate: sendTransaction } = useSendTransaction();

    const updateBalance = useCallback(async () => {
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
    }, [account, props.contract]);

    const {
        handleMint,
        isPending: isMintPending
    } = useTokenMintLogic({
        contract: props.contract,
        setTransactionStep,
        setShowTransactionStatus,
        quantity,
        updateBalance
    });

    // Efecto para actualizar el balance
    useEffect(() => {
        if (account) {
            updateBalance();
            const intervalId = setInterval(updateBalance, 5000);
            return () => clearInterval(intervalId);
        }
    }, [account, updateBalance]);

    // Efecto para manejar el cambio de red
    useEffect(() => {
        if (!activeWallet || !account || isChangingChain) return;

        const handleChainSwitch = async () => {
            try {
                if (!currentChain || currentChain.id !== baseChain.id) {
                    setIsChangingChain(true);
                    await switchChain(baseChain);
                    toast.success("¡Red cambiada exitosamente a Base Mainnet!");
                }
            } catch (error) {
                console.error("Error switching chain:", error);
                toast.error("Error al cambiar de red. Por favor, inténtalo manualmente.");
            } finally {
                setIsChangingChain(false);
            }
        };

        handleChainSwitch();
    }, [activeWallet, account, currentChain, switchChain, isChangingChain]);

    if (isChangingChain) {
        toast.error("Cambio de red en proceso, por favor espera...");
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

    const handleAddToWallet = async () => {
        try {
            if (typeof window.ethereum === 'undefined') {
                toast.error("Por favor instala MetaMask", {
                    style: {
                        background: 'linear-gradient(to right, rgb(147, 51, 234), rgb(219, 39, 119))',
                        color: 'white',
                        border: 'none'
                    }
                });
                return;
            }

            const tokenParams: AddTokenParams = {
                address: props.contract.address,
                symbol: "AGOD",
                decimals: 18,
                image: props.contractImage
            };

            try {
                const wasAdded = await window.ethereum.request({
                    method: 'wallet_watchAsset',
                    params: {
                        type: 'ERC20',
                        options: tokenParams
                    }
                });

                if (wasAdded) {
                    toast.success("¡AGOD Token añadido exitosamente!", {
                        style: {
                            background: 'linear-gradient(to right, rgb(147, 51, 234), rgb(219, 39, 119))',
                            color: 'white',
                            border: 'none'
                        }
                    });
                } else {
                    toast.error("No se pudo añadir el token", {
                        style: {
                            background: 'linear-gradient(to right, rgb(147, 51, 234), rgb(219, 39, 119))',
                            color: 'white',
                            border: 'none'
                        }
                    });
                }
            } catch (error: any) {
                console.error("Error al añadir token:", error);
                if (error.code === 4001) {
                    toast.error("Operación cancelada por el usuario", {
                        style: {
                            background: 'linear-gradient(to right, rgb(147, 51, 234), rgb(219, 39, 119))',
                            color: 'white',
                            border: 'none'
                        }
                    });
                } else {
                    toast.error("Error al añadir el token", {
                        style: {
                            background: 'linear-gradient(to right, rgb(147, 51, 234), rgb(219, 39, 119))',
                            color: 'white',
                            border: 'none'
                        }
                    });
                }
            }
        } catch (error) {
            console.error("Error general:", error);
            toast.error("Error al añadir el token", {
                style: {
                    background: 'linear-gradient(to right, rgb(147, 51, 234), rgb(219, 39, 119))',
                    color: 'white',
                    border: 'none'
                }
            });
        }
    };

    const isAdmin = account?.address.toLowerCase() === "0x00c9f7EE6d1808C09B61E561Af6c787060BFE7C9".toLowerCase();

    if (props.pricePerToken === null || props.pricePerToken === undefined) {
        console.error("Invalid pricePerToken");
        return null;
    }

    const isButtonDisabled = isMintPending || isChangingChain || showTransactionStatus;

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
                                    disabled={isButtonDisabled}
                                >
                                    {isMintPending ? "Minting..." : 
                                    isChangingChain ? "Cambiando Red..." : 
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