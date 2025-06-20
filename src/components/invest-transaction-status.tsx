"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import InvestmentTicket from "./InvestmentTicket"; // Assuming the path is correct

export type InvestTransactionStep = -1 | 0 | 1 | 2;

interface TransactionStatusProps {
  currentStep: InvestTransactionStep;
  isVisible: boolean;
  investmentAmountMXN?: number;
  investmentAmountETH?: number;
  transactionHash?: string;
  walletAddress?: string;
  explorerUrl?: string;
}

interface TicketData {
    transactionId: string;
    investmentAmountMXN: number;
    investmentAmountETH: number;
    investmentInfo: string;
    transactionHash: string;
    walletAddress: string;
}

const steps = [
  { title: "Iniciando transacción", description: "Confirmando en wallet..." },
  { title: "Enviando ETH", description: "Procesando depósito..." },
  { title: "¡Depósito completado!", description: "ETH invertido exitosamente" },
];

export function InvestTransactionStatus({
    currentStep,
    isVisible,
    investmentAmountMXN,
    investmentAmountETH,
    transactionHash,
    walletAddress,
    explorerUrl
}: TransactionStatusProps) {
  const [ticketData, setTicketData] = useState<TicketData | null>(null);

  useEffect(() => {
    if (currentStep === 2 && transactionHash && investmentAmountMXN && investmentAmountETH && walletAddress && explorerUrl) {
      const createTicket = async () => {
        try {
          const response = await fetch('/api/investment-ticket', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              investmentAmountMXN,
              investmentAmountETH,
              investmentInfo: "Pandora's Box Investment",
              transactionHash,
              walletAddress,
            }),
          });
          if (response.ok) {
            const data = await response.json();
            setTicketData(data);
          } else {
            console.error('Failed to create investment ticket');
          }
        } catch (error) {
          console.error('Error calling ticket API:', error);
        }
      };
      createTicket();
    }
  }, [currentStep, transactionHash, investmentAmountMXN, investmentAmountETH, walletAddress]);

  if (!isVisible) return null;

  if (ticketData) {
    return <InvestmentTicket {...ticketData} explorerUrl={explorerUrl} />;
  }

  return (
    <div className="flex flex-col items-center space-y-6 py-8 min-h-[200px]">
      {steps.map((step, index) => {
        const isPending = currentStep === index;
        const isComplete = currentStep > index;

        return (
          <div
            key={index}
            className={`flex items-center space-x-4 transition-opacity duration-500 ${
              currentStep < index ? 'opacity-50' : 'opacity-100'
            }`}
          >
            {isComplete ? (
              <CheckCircle2 className="h-6 w-6 text-green-500 transition-all duration-300" />
            ) : isPending ? (
              <Loader2 className="h-6 w-6 text-purple-500 animate-spin" />
            ) : (
              <Circle className="h-6 w-6 text-gray-400" />
            )}
            <div className="flex flex-col">
              <span
                className={`text-sm font-medium ${
                  isPending ? "text-purple-500" :
                  isComplete ? "text-green-500" :
                  "text-gray-400"
                }`}
              >
                {step.title}
              </span>
              <span className="text-xs text-gray-400">
                {step.description}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}