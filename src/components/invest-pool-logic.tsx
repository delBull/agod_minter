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
  const [depositedEth, setDepositedEth] = useState(0);
  const { mutate: sendTransaction } = useSendTransaction();

  const { data: balance } = useReadContract({
    contract: {
      client,
      chain: baseChain,
      address: CONTRACTS.POOL_SEPOLIA,
      abi: vaultAbi,
    },
    method: "balanceOf",
    params: [account?.address || "0x0"],
  });

  // Update depositedEth when balance changes
  useEffect(() => {
    if (balance) {
      setDepositedEth(Number(utils.formatUnits(balance, 18)));
    }
  }, [balance]);

  const [transactionStep, setTransactionStep] = useState<InvestTransactionStep>(-1);
  const [showTransactionStatus, setShowTransactionStatus] = useState(false);

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

        setTransactionStep(2);
        toast.success("¡Inversión confirmada!", toastStyle);

        setTimeout(() => {
          setShowTransactionStatus(false);
          setTransactionStep(-1);
        }, 5000);
      } catch (e: any) {
        console.error("Error en inversión:", e);
        let errorMessage = errorMessages.default;
        
        if (e?.message.includes("user rejected")) {
          errorMessage = errorMessages.userRejected;
        } else if (e?.message.includes("network")) {
          errorMessage = errorMessages.networkError;
        }
        
        toast.error(errorMessage, toastStyle);
      } finally {
        setLoading(false);
      }
    };

    return (
      <button
        className={`flex items-center gap-2 px-8 w-full sm:w-96 font-mono text-white p-3 rounded-lg mt-2 ${
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
