"use client";

import { useDeposits } from "@/hooks/useDeposits";
import { useActiveAccount } from "thirdweb/react";

export function ActivityPanel() {
  const account = useActiveAccount();
  const { deposits, loading } = useDeposits();

  if (!account) {
    return null;
  }

  return (
    <div className="p-4 bg-zinc-900 rounded-lg mb-5">
      <div className="font-bold text-white mb-3">
        Actividad
      </div>
      {loading ? (
        <div className="text-zinc-400">Cargando actividad...</div>
      ) : (
        <ul className="space-y-1 text-zinc-200 text-xs">
          {deposits.map((dep) => (
            <li key={dep.depositIndex + "_" + dep.timestamp}>
              +{Number(dep.amount) / 1e18} ETH, inv. #
              {dep.depositIndex},{" "}
              {new Date(
                Number(dep.timestamp) * 1000,
              ).toLocaleDateString()}
            </li>
          ))}
          {/* Puedes agregar retiros también, y mostrar el estado */}
        </ul>
      )}
    </div>
  );
}