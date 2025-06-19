"use client";

import { useActiveAccount, useWalletBalance, useReadContract } from "thirdweb/react";
import { balanceOf } from "thirdweb/extensions/erc20";
import { baseSepolia } from "thirdweb/chains";
import { client } from "@/lib/thirdwebClient";

// Componente de balance por token
function TokenBalance({ owner, token }: { owner: string; token: { address: string; symbol: string; decimals: number } }) {
  const { data } = useReadContract(balanceOf, {
    contract: { 
      address: token.address, 
      chain: baseSepolia, 
      client 
    },
    address: owner,
  });

  return (
    <div>
      {token.symbol}:
      <span className="ml-2 text-blue-300 font-mono">
        {data !== undefined && data !== null
          ? (Number(data) / 10 ** token.decimals).toFixed(2)
          : "..."}
      </span>
    </div>
  );
}

// ETH + tokens del usuario en la chain activa
export function WalletBalances({ tokens }: { tokens: { address: string; symbol: string; decimals: number }[] }) {
  const account = useActiveAccount();
  const { data: nativeBalance } = useWalletBalance({
    address: account?.address,
    chain: baseSepolia,
    client,
  });

  if (!account) {
    return null;
  }

  return (
    <div className="p-4 bg-zinc-900 rounded-lg mb-5">
      <div className="font-bold text-white mb-3">
        Mis Fondos
      </div>
      <div className="mb-2">
        ETH:
        <span className="ml-2 text-green-300 font-mono">
          {nativeBalance
            ? Number(nativeBalance.displayValue).toFixed(3)
            : "..."}
        </span>
      </div>
      {tokens.map((t) => (
        <TokenBalance
          key={t.address}
          owner={account.address}
          token={t}
        />
      ))}
    </div>
  );
}