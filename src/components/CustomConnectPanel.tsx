"use client";

import {
  ConnectButton,
  useActiveAccount,
  useDisconnect,
  useActiveWallet,
} from "thirdweb/react";
import { baseSepolia } from "thirdweb/chains";
import { client } from "@/lib/thirdwebClient";
import { createWallet, inAppWallet } from "thirdweb/wallets";

const wallets = [
  inAppWallet(),
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
];

export function CustomConnectPanel() {
  const account = useActiveAccount();
  const wallet = useActiveWallet();
  const { disconnect } = useDisconnect();

  return account && wallet ? (
    <div className="flex items-center gap-4 bg-zinc-900 p-3 rounded-lg">
      <img
        src={`https://effigy.im/a/${account.address}.svg`}
        className="w-8 h-8 rounded-full"
        alt="Account avatar"
      />
      <span className="font-mono text-green-300">
        {account.address.slice(0, 6)}...
        {account.address.slice(-4)}
      </span>
      <span className="bg-green-800 text-green-100 px-2 py-1 rounded text-xs">
        Conectado
      </span>
      <button
        onClick={() => disconnect(wallet)}
        className="ml-2 text-red-400 underline text-xs"
      >
        Desconectar
      </button>
    </div>
  ) : (
    <ConnectButton
      client={client}
      wallets={wallets}
      connectButton={{ label: "Conectar Wallet", className: "w-full" }}
      theme="dark"
      chain={baseSepolia}
    />
  );
}