"use client";

import {
  useActiveAccount,
  useReadContract,
  useSendTransaction,
} from "thirdweb/react";
import { getContract } from "thirdweb";
import { client } from "@/lib/thirdwebClient";
import { baseChain } from "@/lib/chains";
import { formatUnits, parseUnits } from "viem";
import { useState, useEffect } from "react";
import vaultAbi from "./abis/TimeLockedEthInvestmentVault.json";
import { CONTRACTS } from "@/lib/constants";
import { useEthPrice } from "@/hooks/use-eth-price";
import type { InvestTransactionStep } from "./invest-transaction-status";
import { prepareContractCall } from "thirdweb/transaction";

export const useInvestPoolLogic = () => {
  const address = useActiveAccount();
  const { convertETHtoMXN, convertMXNtoETH } = useEthPrice();

  const [transactionStep, setTransactionStep] =
    useState<InvestTransactionStep>(-1);
  const [showTransactionStatus, setShowTransactionStatus] = useState(false);

  const vaultContract = getContract({
    client,
    chain: baseChain,
    address: CONTRACTS.POOL,
    abi: vaultAbi as any,
  });

  const { mutateAsync: sendTx, isPending: isDepositing } =
    useSendTransaction();

  const {
    data: userDeposits,
    refetch: refetchDeposits,
    isLoading: isBalanceLoading,
  } = useReadContract({
    contract: vaultContract,
    method: "getUserDepositInfo",
    params: [address?.address || "0x0"],
    queryOptions: {
      enabled: !!address,
    },
  });

  const [depositedMXN, setDepositedMXN] = useState<number | undefined>(
    undefined,
  );

  useEffect(() => {
    if (isBalanceLoading) {
      setDepositedMXN(undefined);
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
      setDepositedMXN(0);
    }
  }, [userDeposits, isBalanceLoading, convertETHtoMXN]);

  const handleInvest = async (amountMXN: number) => {
    if (!address) throw new Error("Wallet no conectada");

    const amountEth = convertMXNtoETH(amountMXN);
    const amountWei = parseUnits(amountEth.toString(), 18);

    const tx = prepareContractCall({
      contract: vaultContract,
      method: "deposit",
      params: [address.address],
      value: amountWei,
    });

    const { transactionHash } = await sendTx(tx);
    await refetchDeposits();
    return { transactionHash, amountEth };
  };

  return {
    depositedMXN,
    refetchDeposits,
    isBalanceLoading,
    transactionStep,
    setTransactionStep,
    showTransactionStatus,
    setShowTransactionStatus,
    handleInvest,
    isDepositing,
    vaultContract,
  };
};
