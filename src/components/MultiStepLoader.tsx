"use client";
import React, { useState } from "react";
import { MultiStepLoader as Loader } from "./ui/multi-step-loader";
import { IconSquareRoundedX } from "@tabler/icons-react";

const loadingStates = [
  {
    text: "Preparando tu experiencia Web3",
  },
  {
    text: "Configurando tu cartera digital",
  },
  {
    text: "Estableciendo conexiones seguras",
  },
  {
    text: "Verificando la red blockchain",
  },
  {
    text: "Casi listo para comenzar",
  },
];

interface MultiStepLoaderProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MultiStepLoaderDemo({ isOpen, onClose }: MultiStepLoaderProps) {
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full h-[60vh] flex items-center justify-center">
            <Loader loadingStates={loadingStates} loading={isOpen} duration={2000} />
            
            <button
              className="fixed top-4 right-4 text-white z-[120]"
              onClick={onClose}
            >
              <IconSquareRoundedX className="h-10 w-10" />
            </button>
          </div>
        </div>
      )}
    </>
  );
} 