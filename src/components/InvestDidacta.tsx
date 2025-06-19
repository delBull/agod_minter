"use client";

import { useState } from "react";
import { useInvestPoolLogic } from "./invest-pool-logic";
import { useActiveAccount } from "thirdweb/react";

const pasos = [
  {
    title: "Bienvenido a Pandora's Pool",
    desc: "Invierte de forma fácil y segura en proyectos reales. Hazlo con pocos clics, sin experiencia previa blockchain.",
  },
  {
    title: "¿Cómo invertir?",
    desc: "Elige la cantidad de <b>ETH</b> que desees invertir (puedes invertir fracciones, ejemplo: 0.1). Recuerda: tus fondos estarán bloqueados por 6 meses.",
  },
  {
    title: "Confirma tu inversión",
    desc: "Confirmarás desde tu wallet. Si es la primera vez, revisa que estés en la red <b>Base Sepolia</b>. Al terminar verás tu inversión reflejada aquí.",
  },
  {
    title: "¿Y después?",
    desc: "Puedes seguir el estado de tus depósitos, desbloqueo y rendimientos en tiempo real. Recibirás notificaciones cuando puedas retirar.",
  },
];

export function InvestDidacta() {
  const [step, setStep] = useState(0);
  const account = useActiveAccount();
  const { handleInvest, isDepositing } = useInvestPoolLogic();
  const [amount, setAmount] = useState(0.1);
  const isLastStep = step === pasos.length - 1;

  return (
    <div className="max-w-xl mx-auto bg-zinc-900 p-6 rounded-xl shadow-lg mt-8 mb-6 animate-fadeIn">
      <h2 className="text-2xl font-bold text-center text-purple-300 mb-2">
        {pasos[step].title}
      </h2>
      <div
        className="text-zinc-100 text-center mb-4"
        dangerouslySetInnerHTML={{
          __html: pasos[step].desc,
        }}
      />
      {step === 1 && (
        <div className="flex justify-center items-center gap-2 mb-4">
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) =>
              setAmount(Number(e.target.value))
            }
            className="w-32 p-2 rounded bg-zinc-800 text-white text-center border-none outline-none"
          />
          <span className="text-zinc-300 font-mono">
            ETH
          </span>
        </div>
      )}
      {step === 2 && account && (
        <div className="mb-4 flex justify-center">
          <button
            onClick={() => handleInvest(amount)}
            disabled={isDepositing}
            className="btn-wallet-accion"
          >
            {isDepositing ? "Invirtiendo..." : `Invertir ${amount} ETH`}
          </button>
        </div>
      )}
      <div className="flex gap-2 justify-center mt-2">
        <button
          className="btn-wallet-accion"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
        >
          Atrás
        </button>
        {!isLastStep ? (
          <button
            className="btn-wallet-accion"
            onClick={() =>
              setStep((s) =>
                Math.min(pasos.length - 1, s + 1),
              )
            }
          >
            Siguiente
          </button>
        ) : (
          <button
            className="btn-wallet-accion"
            onClick={() => setStep(0)}
          >
            Reiniciar
          </button>
        )}
      </div>
      <div className="text-zinc-400 text-xs text-center mt-4">
        Paso {step + 1} de {pasos.length}
      </div>
    </div>
  );
}