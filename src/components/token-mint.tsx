"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Minus, Plus, Coins } from "lucide-react";
import type { ThirdwebContract } from "thirdweb";
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { client } from "@/lib/thirdwebClient";
import { useTokenMintLogic, TransactionStep } from './token-mint-logic';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { balanceOf } from "thirdweb/extensions/erc20";
import { useReadContract } from "thirdweb/react";
import { inAppWallet, createWallet } from "thirdweb/wallets";
import { toast } from "sonner";
import { TransactionStatus } from "./transaction-status";
import CountUp from "react-countup";

interface Props {
    contract: ThirdwebContract;
    displayName: string;
    description: string;
    contractImage: string;
    pricePerToken: number;
    currencySymbol: string;
}

function formatBalance(balance: number): string {
    const formatted = Math.floor(balance / 1e18);
    return formatted.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
}

const wallets = [
    inAppWallet({
        auth: {
          options: [
            "google",
            "discord",
            "email",
            "x",
            "phone",
            "telegram",
          ],
        },
    }),
    createWallet("io.metamask"),
    createWallet("io.rabby"),
    createWallet("walletConnect"),
    createWallet("io.zerion.wallet"),
];

// Componente StyledConnectButton simplificado
function StyledConnectButton() {
    return (
        <div className="relative mt-10 mb-10">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg opacity-50" />
            <div className="w-96 h-0 flex items-center justify-center bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-[1px] transition-colors">
                <div className="rounded-lg z-10">
                    <ConnectButton 
                        client={client}
                        wallets={wallets}
                        connectButton={{
                            label: "Inicia tu Conexión",
                            className: "bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity"
                        }}
                        theme="dark"
                        connectModal={{
                            size: "compact",
                            showThirdwebBranding: false,
                        }}
                    />
                </div>
            </div>
        </div>
    );
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

export function TokenMint(props: Props) {
    const [quantity, setQuantity] = useState(1);
    const [isMinting, setIsMinting] = useState(false);
    const [transactionStep, setTransactionStep] = useState<TransactionStep>(-1);
    const [showTransactionStatus, setShowTransactionStatus] = useState(false);
    
    const account = useActiveAccount();
    
    // Leer balance de AGOD
    const balanceQuery = useReadContract(balanceOf, {
        contract: props.contract,
        address: account?.address || "0x0000000000000000000000000000000000000000",
        queryOptions: {
            enabled: !!account
        }
    });

    const { renderMintButton } = useTokenMintLogic({
        contract: props.contract,
        setTransactionStep,
        setShowTransactionStatus,
        quantity,
        updateBalance: async () => {
            if (balanceQuery.refetch) {
                await balanceQuery.refetch();
            }
        }
    });

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
            return;
        }
        const numValue = Number.parseInt(value);
        if (!Number.isNaN(numValue)) {
            setQuantity(Math.max(0, numValue));
        }
    };

    const handleAddToWallet = async () => {
        try {
            if (typeof window.ethereum === 'undefined') {
                toast.error("Por favor instala MetaMask", toastStyle);
                return;
            }

            const wasAdded = await window.ethereum.request({
                method: 'wallet_watchAsset',
                params: {
                    type: 'ERC20',
                    options: {
                        address: props.contract.address,
                        symbol: "AGOD",
                        decimals: 18,
                        image: props.contractImage
                    }
                }
            });

            if (wasAdded) {
                toast.success("¡AGOD Token añadido exitosamente!", toastStyle);
            } else {
                toast.error("No se pudo añadir el token", toastStyle);
            }
        } catch (error: any) {
            console.error("Error al añadir token:", error);
            if (error.code === 4001) {
                toast.error("Operación cancelada por el usuario", toastStyle);
            } else {
                toast.error("Error al añadir el token", toastStyle);
            }
        }
    };

    const handleMint = async () => {
        setIsMinting(true);
        setTransactionStep(0);
        setShowTransactionStatus(true);
        
        try {
            // ... resto del código
        } catch (error) {
            // ... manejo de errores
        }
    };

    return (
        <div className="flex flex-col items-center justify-center">
            {!account ? (
                <div className="flex flex-col items-center justify-center">
                    <StyledConnectButton />
                </div>
            ) : (
                <div className="-mt-8 sm:mt-0">
                    <Card className="w-full max-w-sm md:max-w-xl p-4 sm:p-8 animate-fadeIn mx-4 sm:mx-0 -mt-12 md:-mt-5">
                        <CardContent>
                            <h2 className="text-xl sm:text-2xl font-bold mb-2 text-zinc-100 text-center">
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
                                    <div className="text-xs text-center font-medium font-mono text-zinc-400 mb-4">
                                        AGOD Token está en la red Base,<br />conéctate a ella para mintear.
                                    </div>
                                    <div className="flex items-center mb-4">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={decreaseQuantity}
                                            disabled={quantity <= 1}
                                            className="rounded-r-none border-zinc-800 hover:bg-zinc-800"
                                        >
                                            <Minus className="h-4 w-4" />
                                        </Button>

                                        <Input
                                            type="text"
                                            value={quantity === 0 ? "" : quantity}
                                            onChange={handleQuantityChange}
                                            className="w-28 text-center text-white font-mono rounded-none border-x-0 pl-6 border-zinc-800 bg-transparent focus:ring-0 focus:border-zinc-700"
                                            placeholder="0"
                                        />

                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={increaseQuantity}
                                            className="rounded-l-none border-zinc-800 hover:bg-zinc-800"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    <div className="text-base font-semibold text-zinc-100 mb-2">
                                        Total: <CountUp 
                                            end={props.pricePerToken * quantity}
                                            decimals={3}
                                            separator=","
                                            decimal="."
                                        /> {props.currencySymbol}
                                    </div>

                                    <div className="text-xs text-zinc-400 font-mono">
                                        {balanceQuery.data ? 
                                            `Tienes ${formatBalance(Number(balanceQuery.data))} AGOD Tokens` :
                                            "Aún no tienes AGOD Tokens"}
                                    </div>
                                </div>
                            )}
                        </CardContent>

                        <CardFooter className="flex flex-col items-center justify-center">
                            <div className="flex items-center gap-2 w-full sm:w-96 px-2 sm:px-0">
                                <div className="flex-1">
                                    {account ? (
                                        renderMintButton(quantity, false, "", isMinting)
                                    ) : (
                                        <ConnectButton
                                            client={client}
                                            connectButton={{
                                                style: { width: "100%" }
                                            }}
                                        />
                                    )}
                                </div>
                                {account && (
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-md" />
                                        <TooltipProvider>
                                            <Tooltip delayDuration={100}>
                                                <TooltipTrigger asChild>
                                                    <button
                                                        onClick={handleAddToWallet}
                                                        className="relative px-3 sm:px-4 h-9 rounded-md bg-transparent flex items-center gap-1 text-[10px] font-mono font-bold text-zinc-100 hover:text-zinc-200 transition-colors border border-transparent hover:border-zinc-700"
                                                    >
                                                        <span>AGOD</span>
                                                        <Coins className="h-4 w-4" />
                                                    </button>
                                                </TooltipTrigger>
                                                <TooltipContent className="bg-zinc-800 border-zinc-700 text-zinc-100 text-xs">
                                                    <p>Agrega AGOD a tu Wallet</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                )}
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