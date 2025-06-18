"use client";

import { toast } from "sonner";
import {
  useActiveAccount,
  useReadContract,
  useSendTransaction,
} from "thirdweb/react";
import { getContract } from "thirdweb";
import { client } from "@/lib/thirdwebClient";
import { baseChain } from "@/lib/chains";
import { prepareContractCall } from "thirdweb/transaction";
import { parseUnits, formatUnits } from "viem";
import { useState, useEffect } from "react";
import vaultAbi from "./abis/TimeLockedEthInvestmentVault.json";
import { CONTRACTS } from "@/lib/constants";
import type { InvestTransactionStep } from "./invest-transaction-status";
import { useEthPrice } from "@/hooks/use-eth-price";

const toastStyle = {
    style: {
        background: "linear-gradient(to right, #16a34a, #6ee7b7)",
        color: "white",
        fontFamily: "monospace",
        fontSize: "1rem",
        borderRadius: "0.5rem",
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
        border: "none",
    },
    duration: 5000,
};

const errorMessages = {
    userRejected: "Operación cancelada por el usuario",
    insufficientFunds: "No tienes suficientes fondos para completar la operación",
    default: "Algo salió mal. Por favor, inténtalo más tarde",
    networkError: "Error de conexión. Verifica tu red e inténtalo de nuevo"
};

export const useInvestPoolLogic = () => {
  const address = useActiveAccount();
  const { convertETHtoMXN, convertMXNtoETH } = useEthPrice();

  const vault = getContract({
    client,
    chain: baseChain,
    address: CONTRACTS.POOL,
    abi: vaultAbi as any,
  });

  // Lee el historial de depósitos del usuario
  const {
    data: userDeposits,
    refetch: refetchDeposits,
    isLoading: isBalanceLoading,
  } = useReadContract({
    contract: vault,
    method: "getUserDepositInfo",
    params: [address?.address || "0x0"],
    queryOptions: {
      enabled: !!address,
    },
  });

  const [depositedMXN, setDepositedMXN] = useState<number | undefined>(
    undefined,
  );
  const [transactionStep, setTransactionStep] =
    useState<InvestTransactionStep>(-1);
  const [showTransactionStatus, setShowTransactionStatus] =
    useState(false);

  // Hook para llamar a deposit()
  const { mutateAsync: sendTx, isPending: isDepositing } = useSendTransaction();

  // Cuando cambian los datos de userDeposits, recalculamos
  useEffect(() => {
    if (isBalanceLoading) {
      setDepositedMXN(undefined); // Muestra "Cargando..."
    } else if (userDeposits && Array.isArray(userDeposits)) {
      const [amounts = [], , withdrawn = []] = userDeposits as [
        bigint[],
        bigint[],
        boolean[],
      ];
      const totalEth = amounts.reduce((sum, amt, idx) => {
        if (!withdrawn[idx]) {
          return sum + Number(formatUnits(amt, 18));
        }
        return sum;
      }, 0);
      setDepositedMXN(convertETHtoMXN(totalEth));
    } else {
      // Si no está cargando y no hay depósitos, el balance es 0
      setDepositedMXN(0);
    }
  }, [userDeposits, isBalanceLoading, convertETHtoMXN]);

  const InvestButton = (amountMXN: number) => {
    if (!vault || !address) return null;

    const handleInvest = async () => {
      try {
        setShowTransactionStatus(true);
        setTransactionStep(0);

        if (amountMXN < 100) {
          toast.error("El monto mínimo de inversión es de 100 MXN", toastStyle);
          setShowTransactionStatus(false);
          return;
        }

        const amountEth = convertMXNtoETH(amountMXN);
        const amountWei = parseUnits(amountEth.toString(), 18);

        const tx = prepareContractCall({
          contract: vault,
          method: "deposit",
          params: [address.address],
          value: amountWei,
        });

        toast.success("Iniciando transacción…", toastStyle);
        await sendTx(tx);
        setTransactionStep(1);

        toast.success("Transacción enviada", toastStyle);

        // Refresca balance
        await refetchDeposits();

        setTransactionStep(2);
        toast.success("¡Inversión confirmada!", toastStyle);

        setTimeout(() => {
          setShowTransactionStatus(false);
          setTransactionStep(-1);
        }, 3000);
      } catch (e: any) {
        console.error(e);
        setShowTransactionStatus(false);
        setTransactionStep(-1);
        let errorMessage = errorMessages.default;
        if (e.message.includes("user rejected")) {
            errorMessage = errorMessages.userRejected;
        } else if (e.message.includes("insufficient funds")) {
            errorMessage = errorMessages.insufficientFunds;
        } else if (e.message.includes("network")) {
            errorMessage = errorMessages.networkError;
        }
        toast.error(errorMessage, toastStyle);
      }
    };

    return (
      <button
        onClick={handleInvest}
        disabled={isDepositing || amountMXN < 100}
        className={`w-full font-mono text-white py-2 px-3 rounded-lg mt-2 text-sm ${
          isDepositing
            ? "bg-gray-500 cursor-not-allowed"
            : "bg-gradient-to-r from-green-600 to-green-300 hover:opacity-90"
        }`}
      >
        {isDepositing
          ? "Procesando..."
          : `Invertir ${Math.floor(amountMXN)} MXN`}
      </button>
    );
  };

  return {
    InvestButton,
    depositedMXN,
    transactionStep,
    showTransactionStatus,
  };
};
