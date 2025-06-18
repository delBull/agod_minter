"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus } from "lucide-react";
import { useActiveAccount } from "thirdweb/react";
import { useInvestPoolLogic } from "./invest-pool-logic";
import Image from "next/image";
import { InvestTransactionStatus } from "./invest-transaction-status";

export function InvestPool() {
  const address = useActiveAccount();
  const [amount, setAmount] = useState(100);
  const {
    InvestButton,
    depositedMXN,
    transactionStep,
    showTransactionStatus,
  } = useInvestPoolLogic();

  if (!address) return null;

  return (
    <Card className="w-full max-w-md p-4 sm:p-8 animate-fadeIn relative">
      <CardContent className="mb-3">
        <h2 className="text-xl font-bold text-white text-center mb-2">
          Pandora’s Family & Friends Pool
        </h2>
        <p className="text-sm text-gray-200 text-center mb-4">
          Invierte capital semilla con bloqueo máximo de 6 meses. Rendimiento en USDC y transparencia total on‑chain.
        </p>
        <Image
          src="/pandoras/pkey.png"
          alt="Pandora's Key"
          width={150}
          height={200}
          className="mx-auto mb-6 rounded-lg shadow-lg"
        />

        {showTransactionStatus ? (
          <InvestTransactionStatus
            currentStep={transactionStep}
            isVisible={showTransactionStatus}
          />
        ) : (
          <>
            <div className="flex items-center justify-center mb-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setAmount((a) => Math.max(100, a - 1))
                }
                disabled={amount <= 100}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                min="100"
                step="1"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value))}
                className="mx-2 w-24 text-center text-white bg-transparent"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setAmount((a) => a + 1)
                }
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="text-center text-xs text-zinc-400 font-mono mb-4">
              {depositedMXN === undefined ? (
                <span>Cargando balance…</span>
              ) : depositedMXN > 0 ? (
                <>
                  <div className="text-base font-semibold text-zinc-100">
                    Total en Pool: {depositedMXN.toFixed(2)} MXN
                  </div>
                  <div className="text-xs text-zinc-400 font-mono">
                    Tu posición actual
                  </div>
                </>
              ) : (
                <span className="text-base font-semibold text-zinc-100">
                  Aún no tienes capital invertido
                </span>
              )}
            </div>
          </>
        )}
      </CardContent>

      <CardFooter className="absolute bottom-2 flex-col items-center left-0 justify-center w-full">
        <div className="flex items-center gap-2 px-8 w-full sm:w-96">
            <div className="flex-1">
                {InvestButton(amount)}
            </div>
        </div>
      </CardFooter>
    </Card>
  );
}
