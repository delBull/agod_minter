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
    inputs: [{ internalType: "address", name: "receiver", type: "address" }],
    name: "deposit",
    outputs: [{ internalType: "uint256", name: "shares", type: "uint256" }],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "getUserDepositInfo",
    outputs: [
      { internalType: "uint256[]", name: "amounts", type: "uint256[]" },
      { internalType: "uint256[]", name: "timestamps", type: "uint256[]" },
      { internalType: "bool[]", name: "withdrawn", type: "bool[]" },
      { internalType: "bool[]", name: "unlockedByAdmin", type: "bool[]" },
      { internalType: "bool[]", name: "fullyRedeemable", type: "bool[]" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "totalDeposited",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
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

  const { data: userDeposits, refetch: refetchDeposits } = useReadContract({
    contract: {
      client,
      chain: baseChain,
      address: CONTRACTS.POOL,
      abi: vaultAbi,
    },
    method: "getUserDepositInfo",
    params: [account?.address || "0x0"],
  });

  const { data: totalDeposited } = useReadContract({
    contract: {
      client,
      chain: baseChain,
      address: CONTRACTS.POOL,
      abi: vaultAbi,
    },
    method: "totalDeposited",
    params: [],
  });

  useEffect(() => {
    if (userDeposits) {
      console.log("User deposits data:", {
        raw: userDeposits,
        amounts: userDeposits[0],
        timestamps: userDeposits[1],
        withdrawn: userDeposits[2],
        contractTotal: totalDeposited
      });

      const amounts = userDeposits[0] as bigint[];
      const withdrawn = userDeposits[2] as boolean[];

      const calculatedTotal = amounts.reduce((total: number, amount: bigint, index: number) => {
        if (!withdrawn[index]) {
          return total + Number(utils.formatUnits(amount, 18));
        }
        return total;
      }, 0);

      setDepositedEth(calculatedTotal);

      console.log("Deposit totals:", {
        userTotal: calculatedTotal,
        contractTotal: totalDeposited ? 
          Number(utils.formatUnits(totalDeposited, 18)) : 
          0
      });
    }
  }, [userDeposits, totalDeposited]);

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

        console.log("Preparing transaction with:", {
          address: CONTRACTS.POOL,
          amount: amountWei.toString(),
          account: account.address
        });

    toast.success("Iniciando transacción...", toastStyle);
    const transaction = prepareContractCall({
      contract: {
        client,
        chain: baseChain,
        address: CONTRACTS.POOL,
        abi: vaultAbi,
      },
      method: "deposit",
      params: [account.address],
      value: BigInt(amountWei.toString())
    });

    setTransactionStep(1);
    const tx = await sendTransaction(transaction as any);
    console.log("Transaction sent:", tx);
    toast.success("Transacción enviada", toastStyle);

    await new Promise(resolve => setTimeout(resolve, 20000));

    console.log("Refetching deposits...");
        await refetchDeposits();

    await refetchDeposits();
    
    setTransactionStep(2);
    toast.success("¡Inversión confirmada!", toastStyle);

    setTimeout(() => {
      setShowTransactionStatus(false);
      setTransactionStep(-1);
    }, 3000);

      } catch (e: any) {
        console.error("Error details:", {
          error: e,
          message: e.message,
          code: e.code,
          data: e.data,
          stack: e.stack
        });
        setTransactionStep(-1);
        setShowTransactionStatus(false);
        
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
