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
  const account = useActiveAccount(); 
  const [amount, setAmount] = useState(0.1);
  const {
    InvestButton,
    depositedEth,
    transactionStep,
    showTransactionStatus
  } = useInvestPoolLogic();

  if (!account?.address) return null;

  return (
    <Card className="w-full max-w-md p-4 sm:p-8 animate-fadeIn relative">
      <CardContent className="mb-3">
        <h2 className="text-xl font-bold text-white text-center mb-2">
          Pandora’s Family & Friends Pool
        </h2>
        <p className="text-sm text-gray-200 text-center mb-4">
          Invierte capital semilla con bloqueo máximo de 6 meses. 
          Rendimiento en USDC y transparencia total on‑chain.
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
              setAmount(a =>
                Math.max(
                  0,
                  parseFloat((a - 0.0001).toFixed(4))
                )
              )
            }
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            type="number"
            min="0.0001"
            step="0.0001"
            value={amount}
            onChange={e => setAmount(parseFloat(e.target.value))}
            className="mx-2 w-24 text-center text-white bg-transparent"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              setAmount(a =>
                parseFloat((a + 0.0001).toFixed(4))
              )
            }
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="text-center text-sm text-gray-300 mb-4">
          {depositedEth === undefined ? (
          <>Cargando balance...</>
        ) : depositedEth > 0 ? (
          <>Tienes {depositedEth.toFixed(4)} ETH invertido en el pool</>
        ) : (
          <>Aún no tienes ETH invertido</>
        )}
        </div>
        </>
        )}
      </CardContent>

      <CardFooter className="absolute bottom-4 left-0 w-full">
        <div>
          {InvestButton(amount)}
        </div>
      </CardFooter>
    </Card>
  );
}
