"use client";
import React from "react";
import { MultiStepLoader as Loader } from "./ui/multi-step-loader";
import { IconSquareRoundedX } from "@tabler/icons-react";

const loadingStates = [
  {
    text: "Crear una Wallet Digital",
  },
  {
    text: "Conecta tu Wallet a la red Compatible",
  },
  {
    text: "Accede al AGOD Token Minter",
  },
  {
    text: "Mintea el AGOD Token",
  },
  {
    text: "Verifica el Minteo",
  },
];

interface MultiStepLoaderProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MultiStepLoaderDemo({ isOpen, onClose }: MultiStepLoaderProps) {
  return (
    <div className="fixed inset-0 z-[100] bg-black">
      <div className="absolute inset-0 flex flex-col">
        {/* Contenedor principal */}
        <div className="relative flex-1 flex items-center justify-center">
          <div className="w-full max-w-2xl">
            <div className="multi-step-loader">
              <Loader 
                loadingStates={loadingStates} 
                loading={true} 
                duration={2000}
              />
            </div>
          </div>
        </div>
        {/* Botón de Cerrar */}
        <button
          className="absolute top-4 right-4 text-white z-[120]"
          onClick={onClose}
        >
          <IconSquareRoundedX className="h-10 w-10" />
        </button>
      </div>
    </div>
  );
}