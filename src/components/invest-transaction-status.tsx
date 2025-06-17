"use client";

import { CheckCircle2, Circle, Loader2 } from "lucide-react";

export type InvestTransactionStep = -1 | 0 | 1 | 2;

interface TransactionStatusProps {
  currentStep: InvestTransactionStep;
  isVisible: boolean;
}

const steps = [
  { title: "Iniciando transacción", description: "Confirmando en wallet..." },
  { title: "Enviando ETH", description: "Procesando depósito..." },
  { title: "¡Depósito completado!", description: "ETH invertido exitosamente" },
];

export function InvestTransactionStatus({ currentStep, isVisible }: TransactionStatusProps) {
  if (!isVisible) return null;

  return (
    <div className="flex flex-col items-center space-y-4 animate-fadeIn py-6">
      {steps.map((step, index) => {
        const isPending = currentStep === index;
        const isComplete = currentStep > index;

        return (
          <div key={index} className="flex items-center space-x-3">
            {isComplete ? (
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            ) : isPending ? (
              <Loader2 className="h-6 w-6 text-purple-500 animate-spin" />
            ) : (
              <Circle className="h-6 w-6 text-gray-400" />
            )}
            <div className="flex flex-col">
              <span className={`text-sm ${isPending ? "text-purple-500" : isComplete ? "text-green-500" : "text-gray-400"}`}>
                {step.title}
              </span>
              <span className="text-xs text-gray-400">{step.description}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}