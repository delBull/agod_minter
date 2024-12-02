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
import { toast } from "sonner";

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
        const value = Number.parseInt(e.target.value);
        if (!Number.isNaN(value)) {
            setQuantity(Math.max(1, value));
        }
    };

    const handleAddToWallet = async () => {
        try {
            if (typeof window.ethereum === 'undefined') {
                toast.error("Por favor instala MetaMask");
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
                toast.success("¡AGOD Token añadido exitosamente!");
            }
        } catch (error) {
            console.error("Error al añadir token:", error);
            toast.error("Error al añadir el token");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center">
            <Card className="w-full max-w-sm md:max-w-xl p-4 sm:p-8">
                <CardContent>
                    <h2 className="text-xl sm:text-2xl font-bold mb-2 text-zinc-100">
                        {props.displayName}
                    </h2>
                    <p className="text-sm sm:text-base text-zinc-300 mb-4 sm:mb-8 text-center">
                        {props.description}
                    </p>

                    <div className="flex flex-col items-center justify-center mb-4">
                        <div className="text-xs text-center font-medium font-mono text-zinc-400 mb-2">
                            AGOD Token está en la red Base,<br />conéctate a ella para mintear.
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
                                type="text"
                                value={quantity === 0 ? "" : quantity}
                                onChange={handleQuantityChange}
                                className="w-28 text-center text-white font-mono rounded-none border-x-0 pl-6 border-zinc-800 bg-transparent"
                                placeholder="0"
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
                            Total: {(props.pricePerToken * quantity).toFixed(3)} {props.currencySymbol}
                        </div>

                        <div className="text-xs pr-1 text-zinc-400 font-mono mt-1">
                            {balanceQuery.data ? 
                                `Tienes ${formatBalance(Number(balanceQuery.data))} AGOD Tokens` :
                                "Aún no tienes AGOD Tokens"}
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 w-full">
                        {account ? (
                            <>
                                {renderMintButton(quantity, false, "", isMinting)}
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
                            </>
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
                        <div className="w-full flex justify-center">
                            <ConnectButton
                                client={client}
                                connectButton={{
                                    style: { width: "100%" },
                                    label: `${account.address.slice(0, 6)}...${account.address.slice(-4)}`
                                }}
                            />
                        </div>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}