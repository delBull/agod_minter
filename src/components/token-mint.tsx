"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Minus, Plus } from "lucide-react";
import { useTheme } from "next-themes";
import type { ThirdwebContract } from "thirdweb";
import {
    MediaRenderer,
    useActiveAccount,
    ConnectButton,
    useSendTransaction,
    useDisconnect,
    useActiveWallet,
    darkTheme,
    useConnect,
    useSwitchActiveWalletChain,
    useActiveWalletChain
} from "thirdweb/react";
import { client } from "@/lib/thirdwebClient";
import { createWallet, inAppWallet } from "thirdweb/wallets";
import { getContract } from "thirdweb/contract";
import { balanceOf } from "thirdweb/extensions/erc20";
import React from "react";
import { toast } from "sonner";
import { useSpring, animated } from "react-spring";
import CountUp from "react-countup";
import { claimTo } from "thirdweb/extensions/erc20";
import { Button } from "@/components/ui/button";
import { sepoliaChain } from "@/lib/chains";

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
    // Convert from wei (18 decimals) to regular number
    const formatted = balance / 1e18;
    // Remove trailing zeros and unnecessary decimal points
    return formatted.toString().replace(/\.?0+$/, '');
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
                    "passkey",
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
        toast.success("Wallet connected successfully!");
    }, []);

    return (
        <div className="relative mt-10 mb-10">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg opacity-50" />
            <div className="w-96 h-1 flex items-center justify-center bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-[1px] transition-colors">
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

    const updateBalance = async () => {
        if (account && props.contract) {
            try {
                const contract = getContract({
                    client,
                    address: props.contract.address,
                    chain: sepoliaChain
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

    // Effect for handling chain switching
    useEffect(() => {
        const handleChainSwitch = async () => {
            if (!activeWallet || !account || isChangingChain) return;

            try {
                console.log("%cChecking Chain", "color: blue; font-weight: bold;");
                console.log("  Current Chain ID:", currentChain?.id);
                console.log("  Target Chain ID:", sepoliaChain.id);

                if (!currentChain || currentChain.id !== sepoliaChain.id) {
                    console.log("%cSwitching Chain", "color: orange; font-weight: bold;");
                    console.log("  From:", currentChain?.name || "unknown");
                    console.log("  To:", sepoliaChain.name);
                    
                    setIsChangingChain(true);
                    await switchChain(sepoliaChain);
                    
                    console.log("%cChain Switch Success", "color: green; font-weight: bold;");
                    toast.success("Successfully switched to Sepolia network");
                } else {
                    console.log("%cAlready on correct chain", "color: green; font-weight: bold;");
                }
            } catch (error) {
                console.error("%cChain Switch Error", "color: red; font-weight: bold;", error);
                toast.error("Error al cambiar de red. Por favor, inténtalo manualmente.");
            } finally {
                setIsChangingChain(false);
            }
        };

        handleChainSwitch();
    }, [activeWallet, account, currentChain, switchChain, isChangingChain]);

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

    const handleMint = async () => {
        if (!account) {
            toast.error("Please connect your wallet first");
            return;
        }

        try {
            // Check and switch chain if needed before minting
            if (!currentChain || currentChain.id !== sepoliaChain.id) {
                try {
                    console.log("%cSwitching chain before minting", "color: orange; font-weight: bold;");
                    await switchChain(sepoliaChain);
                    console.log("%cChain switched successfully", "color: green; font-weight: bold;");
                } catch (error) {
                    console.error("%cError switching chain", "color: red; font-weight: bold;", error);
                    toast.error("Error al cambiar de red. Por favor, inténtalo manualmente.");
                    return;
                }
            }

            console.log("%cStarting mint", "color: blue; font-weight: bold;");
            console.log("  Quantity:", quantity);
            console.log("  Address:", account.address);

            const transaction = claimTo({
                contract: props.contract,
                to: account.address,
                quantity: String(quantity),
            });

            sendTransaction(transaction, {
                onSuccess: () => {
                    console.log("%cMint successful", "color: green; font-weight: bold;");
                    toast.success("Tokens minted successfully!");
                    setTimeout(updateBalance, 2000);
                },
                onError: (error) => {
                    console.error("%cMint error", "color: red; font-weight: bold;", error);
                    toast.error(error.message);
                },
            });
        } catch (error) {
            console.error("%cMint error", "color: red; font-weight: bold;", error);
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("Failed to mint tokens");
            }
        }
    };

    if (props.pricePerToken === null || props.pricePerToken === undefined) {
        console.error("Invalid pricePerToken");
        return null;
    }

    // If no account is connected, only show the connect button
    if (!account) {
        return (
            <div className="flex flex-col items-center justify-center -mt-32">
                <StyledConnectButton />
            </div>
        );
    }

    // Show the complete interface when an account is connected
    return (
        <div className="flex flex-col items-center justify-center ">
            <Card className="w-full max-w-xl p-8 animate-fadeIn">
                <CardContent className="flex flex-col items-center justify-center">
                    <h2 className="text-2xl font-bold mb-2 text-zinc-100">
                        {props.displayName}
                    </h2>
                    <p className="text-zinc-300 mb-8 text-center">
                        {props.description}
                    </p>

                    <div className="flex flex-col items-center justify-center mb-4">
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
                            Total: <CountUp end={props.pricePerToken * quantity} /> {props.currencySymbol}
                        </div>

                        <div className="text-xs pr-1 text-zinc-400 font-mono mt-1">
                            Tienes {formatBalance(tokenBalance)} AGOD Tokens
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="flex flex-col items-center justify-center">
                    <div className="flex flex-col items-center justify-center w-full">
                        <Button
                            variant="gradient"
                            className="flex-1"
                            onClick={handleMint}
                            disabled={isPending || isChangingChain}
                        >
                            {isPending ? "Minting..." : isChangingChain ? "Switching Network..." : `Mint ${quantity} Token${quantity > 1 ? "s" : ""}`}
                        </Button>
                        <StyledConnectButton />
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
