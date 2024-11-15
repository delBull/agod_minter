"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useSpring, animated, SpringValue } from "react-spring";
import CountUp from "react-countup";
import toast, { Toaster } from "react-hot-toast";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Toast } from "@/components/ui/toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Minus, Plus } from "lucide-react";
import type { ThirdwebContract, sendTransaction } from "thirdweb";
import {
    ConnectButton,
    MediaRenderer,
    useActiveAccount,
} from "thirdweb/react";
import { client } from "@/lib/thirdwebClient";
import React from "react";
import { Skeleton } from "./ui/skeleton";
import { claimTo } from "thirdweb/extensions/erc20"; // Importa claimTo
import type { Erc20 } from "@thirdweb-dev/sdk";

type Props = {
    contract: ThirdwebContract;
    displayName: string;
    description: string;
    contractImage: string;
    pricePerToken: number | null;
    currencySymbol: string | null;
    isERC20: boolean; // Añadido para evitar error en Línea 70
};

export function TokenMint(props: Props) {
    const [isMinting, setIsMinting] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [useCustomAddress, setUseCustomAddress] = useState(false);
    const [customAddress, setCustomAddress] = useState("");
    const account = useActiveAccount();

    // Hook useSpring fuera de cualquier condicional
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

    // Maneja el caso de un precio nulo
    if (props.pricePerToken === null || props.pricePerToken === undefined) {
        console.error("Invalid pricePerToken");
        return <div>Error: Invalid price</div>; // Muestra un mensaje en lugar de retornar null
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen -mt-32 bg-gray-100 bg-opacity-0 dark:bg-gray-900 transition-colors duration-200">
            <div className="absolute top-4 right-4">
                <ConnectButton client={client} />
            </div>
            <Card className="grid lg:grid-cols-2 gap-8 justify-center w-full max-w-3xl p-8 bg-gray-100 bg-opacity-90 backdrop-blur-md border-0">
                <CardContent className="flex flex-col items-center justify-center">
                    <motion.div
                        className="aspect-square overflow-hidden rounded-lg mb-4 relative"
                        whileHover={{ scale: 1.05 }}
                    >
                        <MediaRenderer
                            client={client}
                            className="w-full h-full object-cover"
                            alt=""
                            src={props.contractImage || "/placeholder.svg?height=400&width=400"}
                            style={{
                                filter: "drop-shadow(0px 0px 24px #a726a9a8)",
                            }}
                        />
                        <div className="hidden absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-sm font-semibold">
                            {props.pricePerToken} {props.currencySymbol}/each
                        </div>
                    </motion.div>
                </CardContent>

                <CardContent className="flex flex-col items-center justify-center">
                    <h2 className="text-2xl font-bold mb-2 dark:text-white">
                        {props.displayName}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                        {props.description}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                            <motion.button
                                className="bg-transparent rounded-l-md border border-gray-300 p-2"
                                whileTap={{ scale: 0.9 }}
                                onClick={decreaseQuantity}
                                disabled={quantity <= 1}
                            >
                                <Minus className="h-4 w-4" />
                            </motion.button>

                            <Input
                                type="number"
                                value={Math.round(quantitySpring.number.get())} // Muestra el valor animado como texto
                                onChange={handleQuantityChange}
                                className="w-28 text-center rounded-none border-x-0 pl-6"
                                min="1"
                            />

                            <motion.button
                                className="bg-transparent rounded-r-md border border-gray-300 p-2"
                                whileTap={{ scale: 0.9 }}
                                onClick={increaseQuantity}
                            >
                                <Plus className="h-4 w-4" />
                            </motion.button>
                        </div>

                        <div className="text-base pr-1 font-semibold dark:text-white">
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

                <CardFooter className="flex flex-col items-center justify-center">
                    {account ? (
                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-lg font-semibold text-sm"
                            onClick={async () => {
                                try {
                                    setIsMinting(true);
                                    const tx = await props.contract.erc20.claimTo(
                                        useCustomAddress ? customAddress : account.address,
                                        quantity
                                    );
                                    toast.success("Minting successful!");
                                } catch (error) {
                                    toast.error("Minting failed.");
                                } finally {
                                    setIsMinting(false);
                                }
                            }}
                            disabled={isMinting}
                        >
                            {isMinting ? "Minting..." : "Mint Now"}
                        </motion.button>
                    ) : (
                        <ConnectButton client={client} />
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}

export default TokenMint;


