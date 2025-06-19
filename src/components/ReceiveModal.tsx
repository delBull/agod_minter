"use client";

import { useActiveAccount } from "thirdweb/react";
import { QRCodeSVG } from "qrcode.react";

export function ReceiveModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const account = useActiveAccount();
  if (!open || !account?.address) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950 bg-opacity-70">
      <div className="bg-zinc-900 rounded-xl p-8 shadow-lg w-full max-w-sm relative animate-fadeIn">
        <button
          className="absolute top-2 right-2 text-zinc-400 hover:text-white"
          onClick={onClose}
        >
          ✕
        </button>
        <h2 className="font-bold text-2xl text-white mb-2 text-center">
          Recibir fondos
        </h2>
        <p className="text-zinc-400 text-center mb-6">
          Usa este QR o comparte tu dirección para recibir
          ETH
          <br />
          <span className="text-xs bg-zinc-800 px-2 py-1 rounded mt-2 font-mono inline-block">
            {account.address}
          </span>
        </p>
        <div className="flex justify-center mb-4">
          <QRCodeSVG
            value={account.address}
            size={180}
            fgColor="#eab308"
            bgColor="#18181b"
          />
        </div>
        <button
          onClick={() => {
            navigator.clipboard.writeText(account.address);
            alert("¡Dirección copiada al portapapeles!");
          }}
          className="btn-wallet-accion w-full mt-2"
        >
          Copiar dirección
        </button>
      </div>
    </div>
  );
}