"use client";

import { useActiveAccount } from "thirdweb/react";

export function QuickActions() {
  const account = useActiveAccount();

  if (!account) {
    return null;
  }
  
  // Aquí puedes abrir modal o integrar flows de transfer/withdraw...
  return (
    <div className="flex gap-2 my-4">
      <button className="bg-purple-700 text-white px-4 py-2 rounded">
        Enviar ETH
      </button>
      <button className="bg-pink-600 text-white px-4 py-2 rounded">
        Retirar fondos
      </button>
      <button className="bg-green-700 text-white px-4 py-2 rounded">
        Depositar (Inversión)
      </button>
    </div>
  );
}