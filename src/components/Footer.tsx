"use client";
import { useState } from "react";
import { MultiStepLoaderDemo } from "./MultiStepLoader";

export function Footer() {
  const [isLoaderOpen, setIsLoaderOpen] = useState(false);

  return (
    <>
      <footer className="absolute bottom-0 left-0 right-0 py-4 w-full">
        <div className="w-full px-4 md:px-8 mx-auto">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
            <div className="w-full md:w-auto flex justify-center md:justify-start">
              <p className="text-[10px] md:text-xs text-muted-foreground text-slate-200 whitespace-nowrap">
                ®AGOD Ecosystem 2025. Todos los derechos reservados.
              </p>
            </div>

            <div className="flex gap-4 items-center justify-center md:justify-end">
              <button
                onClick={() => setIsLoaderOpen(true)}
                className="text-xs md:text-sm text-muted-foreground text-slate-300 hover:text-slate-200 transition-colors"
              >
                ¿Nuevo en Wallets?
              </button>
              <span className="text-slate-500">|</span>
              <a
                href="https://agodecosystem.com/politica-privacidad"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs md:text-sm text-muted-foreground text-slate-300 hover:text-slate-200 transition-colors"
              >
                Privacidad
              </a>
            </div>
          </div>
        </div>
      </footer>

      {isLoaderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
          <MultiStepLoaderDemo 
            isOpen={isLoaderOpen}
            onClose={() => setIsLoaderOpen(false)}
          />
        </div>
      )}
    </>
  );
}
