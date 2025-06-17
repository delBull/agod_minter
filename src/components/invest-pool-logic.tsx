"use client";

import { toast } from "sonner";
import { useActiveAccount, useReadContract, useSendTransaction } from "thirdweb/react";
import { prepareContractCall } from "thirdweb";
import { utils } from "ethers";
import { useState, useEffect } from "react";
import { CONTRACTS } from "@/lib/constants";
import { baseChain } from "@/lib/chains";
import { client } from "@/lib/thirdwebClient";
import type { InvestTransactionStep } from "./invest-transaction-status";

const vaultAbi = [
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "deposit",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  }
] as const;

const toastStyle = {
  style: {
    background: "linear-gradient(to right, #9333ea, #db2777)",
    color: "white",
    fontFamily: "monospace",
    fontSize: "1rem",
    borderRadius: "0.5rem",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    border: "none",
    marginBottom: "1rem",
  },
  duration: 5000,
};

const errorMessages = {
  userRejected: "Operación cancelada por el usuario",
  default: "Error realizando la inversión",
  networkError: "Error de conexión. Verifica tu red e inténtalo de nuevo"
};

export const useInvestPoolLogic = () => {
  const account = useActiveAccount();
  const [loading, setLoading] = useState(false);
  const [depositedEth, setDepositedEth] = useState<number | undefined>(undefined);
  const [transactionStep, setTransactionStep] = useState<InvestTransactionStep>(-1);
  const [showTransactionStatus, setShowTransactionStatus] = useState(false);
  const { mutate: sendTransaction } = useSendTransaction();

  const { data: balance, refetch: refetchBalance } = useReadContract({
    contract: {
      client,
      chain: baseChain,
      address: CONTRACTS.POOL_SEPOLIA,
      abi: vaultAbi,
    },
    method: "balanceOf",
    params: [account?.address || "0x0"],
  });

  useEffect(() => {
    if (balance) {
      setDepositedEth(Number(utils.formatUnits(balance, 18)));
    }
  }, [balance]);

  const InvestButton = (amountEth: number) => {
    if (!account?.address) return null;

    const handleInvest = async () => {
      try {
        setLoading(true);
        setTransactionStep(0);
        setShowTransactionStatus(true);

        if (amountEth <= 0) {
          toast.error("Monto debe ser mayor a 0", toastStyle);
          return;
        }

        const amountWei = utils.parseUnits(amountEth.toString(), 18);

        toast.success("Iniciando transacción...", toastStyle);
        const transaction = prepareContractCall({
          contract: {
            client,
            chain: baseChain,
            address: CONTRACTS.POOL_SEPOLIA,
            abi: vaultAbi,
          },
          method: "deposit",
          params: [account.address],
          value: BigInt(amountWei.toString())
        });

        setTransactionStep(1);
        await sendTransaction(transaction as any);
        toast.success("Transacción enviada", toastStyle);

        // Esperar un momento para que la transacción se procese
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Marcar como completado y actualizar balance
        setTransactionStep(2);
        toast.success("¡Inversión confirmada!", toastStyle);
        await refetchBalance();

        // Reset después de mostrar completado
        setTimeout(() => {
          setShowTransactionStatus(false);
          setTransactionStep(-1);
        }, 3000);

      } catch (e: any) {
        console.error("Error en inversión:", e);
        setTransactionStep(-1);
        setShowTransactionStatus(false);
        
        let errorMessage = "Error realizando la inversión";
        if (e?.message.includes("user rejected")) {
          errorMessage = "Operación cancelada";
        }
        
        toast.error(errorMessage, toastStyle);
      } finally {
        setLoading(false);
      }
    };

    return (
      <button
        className={`flex items-center justify-center gap-2 px-8 w-full sm:w-96 font-mono text-white h-[36px] rounded-md ${
          loading
            ? "bg-gray-500 cursor-not-allowed"
            : "bg-gradient-to-r from-green-600 to-green-300 hover:opacity-90"
        }`}
        onClick={handleInvest}
        disabled={loading}
      >
        {loading
          ? "Procesando..."
          : `Invertir ${amountEth.toFixed(4)} ETH`}
      </button>
    );
  };

  return {
    InvestButton,
    depositedEth,
    transactionStep,
    showTransactionStatus,
  };
};
