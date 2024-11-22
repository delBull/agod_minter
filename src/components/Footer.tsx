"use client";
import { useState } from "react";
import { MultiStepLoaderDemo } from "./MultiStepLoader";

export function Footer() {
  const [isLoaderOpen, setIsLoaderOpen] = useState(false);

  return (
    <>
      <footer className="absolute bottom-0 left-0 right-0 py-4 px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <p className="text-xs text-muted-foreground text-slate-200">
            AGOD Ecosystem es una marca ® de MXHUB Ecosistema Blockchain S.A. de C.V
          </p>

          <div className="flex gap-4">
            <button
              onClick={() => setIsLoaderOpen(true)}
              className="text-sm text-muted-foreground text-slate-300 hover:text-slate-200 transition-colors"
            >
              ¿Nuevo en Carteras?
            </button>
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