"use client";

import { toast } from "sonner";
import {
  useContract,
  useContractRead,
  useAddress
} from "@thirdweb-dev/react";
import { ethers } from "ethers";
import { useState } from "react";
import vaultAbi from "./abis/TimeLockedEthInvestmentVault.json";
import { CONTRACTS } from "@/lib/constants";

export const useInvestPoolLogic = () => {
  const address = useAddress();
  const { contract: vault } = useContract(
    CONTRACTS.POOL_SEPOLIA,
    vaultAbi
  );

  const { data: rawBalance } = useContractRead(
    vault!,
    "balanceOf",
    [address || ""]
  );
  const depositedEth = rawBalance
    ? Number(ethers.utils.formatEther(rawBalance as ethers.BigNumber))
    : 0;

  const [loading, setLoading] = useState(false);

  const InvestButton = (amountEth: number) => {
    if (!address) return null;

    const handleInvest = async () => {
      try {
        setLoading(true);
        if (amountEth <= 0) {
          toast.error("Monto debe ser mayor a 0");
          return;
        }
        const amountWei = ethers.utils.parseEther(
          amountEth.toString()
        );
        const tx = await vault!.call(
          "deposit",
          [address],
          { value: amountWei }
        );
        toast.success("Transacción enviada", { duration: 4000 });
        await tx.wait();
        toast.success("¡Inversión confirmada!", {
          duration: 4000,
        });
      } catch (e: any) {
        console.error(e);
        toast.error(
          e?.message.includes("user rejected")
            ? "Operación cancelada"
            : "Error realizando la inversión"
        );
      } finally {
        setLoading(false);
      }
    };

    return (
      <button
        className={`w-full font-mono text-white p-3 rounded mt-2 ${
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
  };
};
