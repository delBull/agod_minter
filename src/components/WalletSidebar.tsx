"use client";

import { useDisconnect, useActiveAccount, useActiveWallet } from "thirdweb/react";
import { WalletBalances } from "@/components/WalletBalances";
import { ActivityPanel } from "@/components/ActivityPanel";
import { useState } from "react";
import { ReceiveModal } from "@/components/ReceiveModal";

export function WalletSidebar() { 
  const account = useActiveAccount();
  const wallet = useActiveWallet();
  const { disconnect } = useDisconnect();
  const [openReceive, setOpenReceive] = useState(false);

  if (!account || !wallet) {
    return null;
  }

  return ( 
    <div className="p-4 bg-zinc-900 rounded-lg">
      <div className="flex items-center gap-3 mb-4">
        <img 
          src={`https://effigy.im/a/${account.address}.svg`} 
          className="rounded-full w-9 h-9" 
          alt="Avatar" 
        />
        <span>
          {account.address.slice(0,6)}…{account.address.slice(-4)}
        </span>
        <button onClick={() => disconnect(wallet)} className="ml-auto text-red-400 underline text-xs">
          Desconectar
        </button>
      </div>

      <WalletBalances tokens={[ 
        { address: "0xFC5fc05E5146f258A29654c03d351d4a61a856DC", symbol: "AGOD", decimals: 18 }, 
        { address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", symbol: "USDC", decimals: 6 }, 
      ]} />

      <ActivityPanel />

      <a href={`https://basescan.org/address/${account.address}`} target="_blank" className="text-indigo-300 underline block mb-4">
        Ver esta wallet en explorer
      </a>

      <button
        onClick={() => setOpenReceive(true)}
        className="btn-wallet-accion w-full mb-2"
      >
        Recibir
      </button>

      <button className="text-zinc-400 text-xs w-full text-center">
        Gestionar wallet
      </button>

      <ReceiveModal
        open={openReceive}
        onClose={() => setOpenReceive(false)}
      />
    </div>
  ); 
}