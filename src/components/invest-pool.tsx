"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Minus, Plus } from "lucide-react";
import { useActiveAccount } from "thirdweb/react";
import { useInvestPoolLogic } from "./invest-pool-logic";

export function InvestPool() {
  // HOOKS SIEMPRE EJECUTÁNDOSE:
  const account = useActiveAccount();
  const [amount, setAmount] = useState(100);
  const { InvestButton } = useInvestPoolLogic();

  // SI NO HAY CUENTA, NO MOSTRAR NADA:
  if (!account) return null;

  // YA HAY CUENTA, MOSTRAR LA POOL:
  return (
    <Card className="p-6">
      <CardContent>
        <h2 className="text-xl font-bold text-white text-center mb-4">
          Pool Pandoras
        </h2>

        <div className="flex items-center justify-center mb-4">
          <button onClick={() => setAmount((a) => Math.max(1, a - 1))}>
            <Minus className="h-5 w-5 text-white" />
          </button>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(+e.target.value)}
            className="mx-2 w-20 text-center"
          />
          <button onClick={() => setAmount((a) => a + 1)}>
            <Plus className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Este botón ya usa la lógica de conexión interna */}
        {InvestButton(amount)}
      </CardContent>

      <CardFooter className="flex justify-center">
        {/* Aquí no ponemos ningún ConnectButton */}
      </CardFooter>
    </Card>
  );
}
