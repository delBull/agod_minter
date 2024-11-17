"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Minus, Plus } from "lucide-react";
import { useTheme } from "next-themes";
import type { ThirdwebContract } from "thirdweb";
import {
    MediaRenderer,
    useActiveAccount,
    ConnectButton,
    useSendTransaction,
    useReadContract,
} from "thirdweb/react";
import { client } from "@/lib/thirdwebClient";
import React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { prepareContractCall } from "thirdweb";
import { claimTo } from "thirdweb/extensions/erc20";

type Props = {
    contract: ThirdwebContract;
    displayName: string;
    description: string;
    contractImage: string;
    pricePerToken: number;
    currencySymbol: string;
    isERC20: boolean;
};

export function TokenMint(props: Props) {
    const [quantity, setQuantity] = useState(1);
    const [useCustomAddress, setUseCustomAddress] = useState(false);
    const [customAddress, setCustomAddress] = useState("");
    const { theme } = useTheme();
    const account = useActiveAccount();
    const { mutate: sendTransaction, isPending } = useSendTransaction();

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
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
            <Card className="w-full max-w-md">
                <CardContent className="pt-6">
                    <div className="aspect-square overflow-hidden rounded-lg mb-4 relative">
                        <MediaRenderer
                            client={client}
                            className="w-full h-full object-cover"
                            alt=""
                            src={props.contractImage || "/placeholder.svg?height=400&width=400"}
                        />
                        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-sm font-semibold">
                            {props.pricePerToken} {props.currencySymbol}/each
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold mb-2 dark:text-white">
                        {props.displayName}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                        {props.description}
                    </p>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={decreaseQuantity}
                                disabled={quantity <= 1}
                                aria-label="Decrease quantity"
                                className="rounded-r-none"
                            >
                                <Minus className="h-4 w-4" />
                            </Button>
                            <Input
                                type="number"
                                value={quantity}
                                onChange={handleQuantityChange}
                                className="w-28 text-center rounded-none border-x-0 pl-6"
                                min="1"
                            />
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={increaseQuantity}
                                aria-label="Increase quantity"
                                className="rounded-l-none"
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="text-base pr-1 font-semibold dark:text-white">
                            Total: {props.pricePerToken * quantity} {props.currencySymbol}
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
                            className={`${useCustomAddress ? "" : "text-gray-400"} cursor-pointer`}
                        >
                            Mint to a custom address
                        </Label>
                    </div>
                    {useCustomAddress && (
                        <div className="mb-4">
                            <Input
                                id="address-input"
                                type="text"
                                placeholder="Enter recipient address"
                                value={customAddress}
                                onChange={(e) => setCustomAddress(e.target.value)}
                                className="w-full"
                            />
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                    {account ? (
                        <Button
                            className="w-full bg-black text-white hover:bg-black/90"
                            onClick={handleMint}
                            disabled={isPending}
                        >
                            {isPending ? "Minting..." : `Mint ${quantity} Token${quantity > 1 ? "s" : ""}`}
                        </Button>
                    ) : (
                        <div className="w-full">
                            <ConnectButton client={client} />
                        </div>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
