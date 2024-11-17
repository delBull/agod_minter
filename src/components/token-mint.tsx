"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Minus, Plus, Wallet, ChevronDown } from "lucide-react";
import { useTheme } from "next-themes";
import type { ThirdwebContract } from "thirdweb";
import {
    MediaRenderer,
    useActiveAccount,
    ConnectButton,
    useSendTransaction,
    useDisconnect,
    useActiveWallet,
} from "thirdweb/react";
import { client } from "@/lib/thirdwebClient";
import React from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useSpring } from "react-spring";
import CountUp from "react-countup";
import { claimTo } from "thirdweb/extensions/erc20";
import { Button } from "@/components/ui/button";

type Props = {
    contract: ThirdwebContract;
    displayName: string;
    description: string;
    contractImage: string;
    pricePerToken: number;
    currencySymbol: string;
    isERC20: boolean;
};

function StyledConnectButton() {
    return (
            <div className="h-1 flex items-center justify-center bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-[1px] transition-colors">
                <ConnectButton 
                client={client}
                connectModal={{
                    title: "Conéctate con AGOD",
                    titleIcon: "/icon.png",
                    size: "wide",
                    showThirdwebBranding: false,
                    }}
                connectButton={{
                    label: "Inicia tu Conexión"
                }}
                locale="es_ES" 
                />
            </div>
    );
}

function WalletButton() {
    return (
        <div>
            <div className="h-10 flex items-center justify-center px-3 gap-2">
                <ConnectButton 
                    client={client}
                    locale="es_ES"
                    connectButton={{
                        label: (
                            <div className="flex items-center gap-2">
                                <Wallet className="h-4 w-4" />
                                <ChevronDown className="h-3 w-3" />
                            </div>
                        ),
                        className: "h-full w-full p-0"
                    }}
                />
            </div>
        </div>
    );
}

export function TokenMint(props: Props) {
    const [quantity, setQuantity] = useState(1);
    const [useCustomAddress, setUseCustomAddress] = useState(false);
    const [customAddress, setCustomAddress] = useState("");
    const { theme } = useTheme();
    const account = useActiveAccount();
    const { mutate: sendTransaction, isPending } = useSendTransaction();

    const quantitySpring = useSpring({ number: quantity, from: { number: 0 } });

    const decreaseQuantity = () => {
        setQuantity((prev) => Math.max(1, prev - 1));
    };

    const increaseQuantity = () => {
        setQuantity((prev) => prev + 1);
    };

    const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number.parseInt(e.target.value);
        if (!Number.isNaN(value)) {
            setQuantity(Math.min(Math.max(1, value)));
        }
    };

    const handleMint = async () => {
        if (!account) {
            toast.error("Please connect your wallet first");
            return;
        }

        try {
            const transaction = claimTo({
                contract: props.contract,
                to: useCustomAddress && customAddress ? customAddress : account.address,
                quantity: String(quantity),
            });

            sendTransaction(transaction, {
                onSuccess: () => toast.success("Tokens minted successfully!"),
                onError: (error) => toast.error(error.message),
            });
        } catch (error) {
            console.error("Error minting:", error);
            toast.error("Failed to mint tokens");
        }
    };

    if (props.pricePerToken === null || props.pricePerToken === undefined) {
        console.error("Invalid pricePerToken");
        return null;
    }

    return (
        <div className="flex flex-col items-center justify-center -mt-32">
            <Card className="w-full max-w-xl p-8">
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
                                value={Math.round(quantitySpring.number.get())}
                                onChange={handleQuantityChange}
                                className="w-28 text-center rounded-none border-x-0 pl-6 border-zinc-800 bg-transparent"
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
                    </div>

                    <div className="flex items-center space-x-2 mb-4">
                        <Switch
                            id="custom-address"
                            checked={useCustomAddress}
                            onCheckedChange={setUseCustomAddress}
                        />
                        <Label
                            htmlFor="custom-address"
                            className={`${useCustomAddress ? "text-zinc-100" : "text-zinc-400"} cursor-pointer`}
                        >
                            Mint to a custom address
                        </Label>
                    </div>

                    {useCustomAddress && (
                        <div className="w-full mb-4">
                            <Input
                                id="address-input"
                                type="text"
                                placeholder="Enter recipient address"
                                value={customAddress}
                                onChange={(e) => setCustomAddress(e.target.value)}
                                className="w-full border-zinc-800 bg-transparent"
                            />
                        </div>
                    )}
                </CardContent>

                <CardFooter className="flex flex-col items-center justify-center space-y-4">
                    {account ? (
                        <div className="flex items-center gap-4 w-full">
                            <Button
                                variant="gradient"
                                className="flex-1"
                                onClick={handleMint}
                                disabled={isPending}
                            >
                                {isPending ? "Minting..." : `Mint ${quantity} Token${quantity > 1 ? "s" : ""}`}
                            </Button>
                            <WalletButton />
                        </div>
                    ) : (
                        <div className="w-full">
                            <StyledConnectButton />
                        </div>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
