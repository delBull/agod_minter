"use client";

import { useActiveAccount } from "thirdweb/react";

export function NFTsPanel() {
  const account = useActiveAccount();
  // Usa tu subgraph o fetcher: muestra sólo tus collections/NFTs
  // Por ejemplo, usando fetch de thirdweb o API de OpenSea testnet

  // ...Alternativamente, consulta tu propio subgraph o backend
  // Consulta y renderiza NFTs con imagen, nombre, descripción
  
  if (!account) {
    return null;
  }

  return (
    <div className="p-4 bg-zinc-900 rounded-lg mb-5">
      <div className="font-bold text-white mb-3">
        Mis NFTs
      </div>
      {/* Aquí mapea tus assets */}
      {/* <NFTCard {...nft} /> */}
      <div className="text-zinc-300 text-xs">
        Sin NFTs encontrados
      </div>
    </div>
  );
}