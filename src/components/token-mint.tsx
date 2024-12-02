"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Minus, Plus } from "lucide-react";
import type { ThirdwebContract } from "thirdweb";
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { client } from "@/lib/thirdwebClient";
import { useTokenMintLogic, TransactionStep } from './token-mint-logic';

interface Props {
    contract: ThirdwebContract;
    displayName: string;
    description: string;
    contractImage: string;
    pricePerToken: number;
    currencySymbol: string;
}

export function TokenMint(props: Props) {
    const [quantity, setQuantity] = useState(1);
    const [useCustomAddress, setUseCustomAddress] = useState(false);
    const [customAddress, setCustomAddress] = useState("");
    const [isMinting, setIsMinting] = useState(false);
    const [transactionStep, setTransactionStep] = useState<TransactionStep>(-1);
    const [showTransactionStatus, setShowTransactionStatus] = useState(false);
    
    const account = useActiveAccount();

    const { renderMintButton } = useTokenMintLogic({
        contract: props.contract,
        setTransactionStep,
        setShowTransactionStatus,
        quantity,
        updateBalance: async () => {
            // Implementar actualización de balance si es necesario
            console.log("Actualizando balance...");
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
                            AGOD Token está en la red Base
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
                        renderMintButton(quantity, useCustomAddress, customAddress, isMinting)
                    ) : (
                        <ConnectButton
                            client={client}
                            connectButton={{
                                style: { width: "100%" }
                            }}
                        />
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}