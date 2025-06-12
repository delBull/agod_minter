"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus } from "lucide-react";
import { useActiveAccount } from "thirdweb/react";
import { useInvestPoolLogic } from "./invest-pool-logic";
import Image from "next/image";

export function InvestPool() {
  // HOOKS SIEMPRE EJECUTÁNDOSE:
  const account = useActiveAccount();
  const [amount, setAmount] = useState(100);
  const { InvestButton } = useInvestPoolLogic();

  // SI NO HAY CUENTA, NO MOSTRAR NADA:
  if (!account) return null;

  // YA HAY CUENTA, MOSTRAR LA POOL:
  return (
    <Card className="w-full max-w-md p-4 sm:p-8 animate-fadeIn">
      <CardContent className="mb-3">
        <div>
        <h2 className="text-xl font-bold text-white text-center mb-4">
          Family & Friends Pandora's Pool
        </h2>
        <p className="text-sm text-gray-200 text-center mb-4">
        Invierte capital semilla con bloqueo máximo de 6 meses. 
        Obtén rendimiento en USDC, con total transparencia en blockchain, 
        y apoya la tokenización de nuestros primeros proyectos inmobiliarios y startups.
        </p>
        <Image
          src="/pandoras/pkey.png"
          alt="Pandora's Key"
          width={150}
          height={200}
          className="mx-auto mb-4 rounded-lg shadow-lg"
        />
        </div>

        <div className="flex items-center justify-center mb-4">
          <Button variant="outline" size="icon" onClick={() => setAmount((a) => Math.max(1, a - 1))}>
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            type="text"
            value={amount}
            onChange={(e) => setAmount(+e.target.value)}
            className="mx-2 w-20 text-center text-white bg-transparent"
          />
          <Button variant="outline" size="icon" onClick={() => setAmount((a) => a + 1)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>

        <CardFooter className="absolute bottom-2 flex-col items-center left-0 justify-center w-full">
          <div className="flex items-center gap-2 px-8 w-full sm:w-96">
            {/* Este botón ya usa la lógica de conexión interna */}
            {InvestButton(amount)}
        </div>
        </CardFooter>
    </Card>
  );
}
