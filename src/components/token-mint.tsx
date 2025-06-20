"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Minus, Plus, Coins } from "lucide-react";
import type { ThirdwebContract } from "thirdweb";
import { useActiveAccount } from "thirdweb/react";
import { useTokenMintLogic, TransactionStep } from "./token-mint-logic";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { balanceOf } from "thirdweb/extensions/erc20";
import { useReadContract } from "thirdweb/react";
import { inAppWallet, createWallet } from "thirdweb/wallets";
import { toast } from "sonner";
import { TransactionStatus } from "./transaction-status";
import CountUp from "react-countup";
import Image from "next/image";

interface Props {
  contract: ThirdwebContract;
  displayName: string;
  description: string;
  contractImage: string;
  pricePerToken: number;
  currencySymbol: string;
  onClose?: () => void;
}

function formatBalance(balance: number): string {
  const formatted = Math.floor(balance / 1e18);
  return formatted.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

// Billeteras configuradas para el ConnectModal
const wallets = [
  inAppWallet({ auth: { options: ["google","discord","email","x","phone","telegram"] } }),
  createWallet("io.metamask"),
  createWallet("io.rabby"),
  createWallet("walletConnect"),
  createWallet("io.zerion.wallet"),
];

// Estilos para los Toasts
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

// Usamos siempre los Hooks en el mismo orden:
export function TokenMint(props: Props) {
  const account = useActiveAccount();
  const [quantity, setQuantity] = useState(1);
  const [isMinting, setIsMinting] = useState(false);
  const [transactionStep, setTransactionStep] = useState<TransactionStep>(-1);
  const [showTransactionStatus, setShowTransactionStatus] = useState(false);

  // Hook que lee el balance
  const balanceQuery = useReadContract(balanceOf, {
    contract: props.contract,
    address: account?.address || "",
    queryOptions: { enabled: !!account },
  });

  // Hook que ofrece renderMintButton()
  const { renderMintButton } = useTokenMintLogic({
    contract: props.contract,
    setTransactionStep,
    setShowTransactionStatus,
    quantity,
    updateBalance: async () => {
      if (balanceQuery.refetch) {
        await balanceQuery.refetch();
      }
    },
  });

  // Funciones para manejar cantidad
  const decreaseQuantity = () => setQuantity((prev) => Math.max(1, prev - 1));
  const increaseQuantity = () => setQuantity((prev) => prev + 1);
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

  // Función para añadir token al wallet
  const handleAddToWallet = async () => {
    try {
      if (typeof window.ethereum === "undefined") {
        toast.error("Por favor instala MetaMask", toastStyle);
        return;
      }
      const wasAdded = await window.ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: props.contract.address,
            symbol: "AGOD",
            decimals: 18,
            image: props.contractImage,
          },
        },
      });
      if (wasAdded) {
        toast.success("¡Token AGOD añadido!", toastStyle);
      } else {
        toast.error("No se pudo añadir el token", toastStyle);
      }
    } catch (error: any) {
      console.error("Error al añadir token:", error);
      toast.error(error.code === 4001 ? "Operación cancelada" : "Error al añadir token", toastStyle);
    }
  };

  // Si no hay cuenta, no renderizamos nada
  if (!account) return null;

  // Ya hay cuenta: mostramos la interfaz
  return (
    <div className="flex flex-col items-center justify-center px-4">
      <Card className="w-full max-w-md p-4 sm:p-8 animate-fadeIn relative">
        {props.onClose && (
          <button
            onClick={props.onClose}
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              zIndex: 20,
              background: "rgba(255,255,255,0.85)",
              borderRadius: "9999px",
              width: 24,
              height: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              boxShadow: "0 2px 8px #0002",
              cursor: "pointer"
            }}
            aria-label="Cerrar"
          >
            <span style={{fontSize: 16, fontWeight: 700, color: "#23272f"}}>×</span>
          </button>
        )}
        <CardContent className="mb-3">
          <h2 className="text-xl font-bold text-zinc-100 text-center">{props.displayName}</h2>
          <p className="text-sm text-zinc-300 mb-4 text-center">{props.description}</p>

          {showTransactionStatus ? (
            <TransactionStatus currentStep={transactionStep} isVisible={showTransactionStatus} />
          ) : (
            <div className="flex flex-col items-center mb-4">
                {/*
              <div className="text-xs text-zinc-400 mb-1 text-center font-mono">
                AGOD Token está en la red de Base.
              </div>
              */}
                      <Image
                        src="/icon.png"
                        alt="AGOD Token"
                        width={100}
                        height={200}
                        className="mx-auto mb-4 rounded-lg shadow-lg"
                      />

              <div className="flex items-center justify-center mb-4">
                <Button variant="outline" size="icon" onClick={decreaseQuantity} disabled={quantity <= 1}>
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="text"
                  value={quantity === 0 ? "" : quantity}
                  onChange={handleQuantityChange}
                  className="mx-2 w-20 text-center text-white bg-transparent"
                />
                <Button variant="outline" size="icon" onClick={increaseQuantity}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="text-base font-semibold text-zinc-100">
                Total:{" "}
                <CountUp
                  end={props.pricePerToken * quantity}
                  decimals={3}
                  separator=","
                  decimal="."
                />{" "}
                {props.currencySymbol}
              </div>

              <div className="text-xs text-zinc-400 font-mono">
                {balanceQuery.data
                  ? `Tienes ${formatBalance(Number(balanceQuery.data))} AGOD Tokens`
                  : "Aún no tienes tokens"}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex-col items-center justify-center w-full pt-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 px-8 w-full sm:w-96">
            <div className="w-full sm:flex-1">
              {renderMintButton(quantity, false, "", isMinting)}
            </div>
            <div className="relative w-full sm:w-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-md" />
              <TooltipProvider>
                <Tooltip delayDuration={100}>
                  <TooltipTrigger asChild>
                    <button onClick={handleAddToWallet} className="relative w-full h-9 px-3 rounded-md flex items-center justify-center gap-1 text-xs font-mono text-zinc-100">
                      <span>AGOD</span>
                      <Coins className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-zinc-800 border-zinc-700 text-zinc-100 text-xs">
                    Agrega AGOD a tu Wallet
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
