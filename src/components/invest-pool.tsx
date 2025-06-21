"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus, Info, Banknote, Youtube } from "lucide-react";
import { useActiveAccount, useActiveWalletChain } from "thirdweb/react";
import { useInvestPoolLogic } from "./invest-pool-logic";
import Image from "next/image";
import { InvestTransactionStatus } from "./invest-transaction-status";
import { toast } from "sonner";
import { useEthPrice } from "@/hooks/use-eth-price";
import { InfoModal } from "./ui/info-modal";
import { PoolInfoContent } from "./pool-info-content";

const greenToastStyle = {
  style: {
    background: "linear-gradient(to right, #16a34a, #6ee7b7)",
    color: "white",
    fontFamily: "monospace",
    fontSize: "1rem",
    borderRadius: "0.5rem",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    border: "none",
  },
  duration: 5000,
};

export function InvestPool({ onClose }: { onClose?: () => void }) {
  const account = useActiveAccount();
  const activeChain = useActiveWalletChain();
  const [amountMXN, setAmountMXN] = useState(100);
  const [isInfoModalOpen, setInfoModalOpen] = useState(false);
  const [isMethodModalOpen, setMethodModalOpen] = useState(false);
  const [isGuideModalOpen, setGuideModalOpen] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState({
    hash: '',
    amountEth: 0,
    amountMxn: 0,
  });

  const {
    depositedMXN,
    refetchDeposits,
    transactionStep,
    setTransactionStep,
    showTransactionStatus,
    setShowTransactionStatus,
    handleInvest,
    isDepositing,
  } = useInvestPoolLogic();
  const { loading: isEthPriceLoading } = useEthPrice();

  if (!account) return null;

  const onInvestClick = async () => {
    if (amountMXN < 100) {
      toast.error("El monto mínimo de inversión es de 100 MXN", greenToastStyle);
      return;
    }
    try {
      setShowTransactionStatus(true);
      setTransactionStep(0);
      toast("Iniciando transacción...", greenToastStyle);

      const { transactionHash, amountEth } = await handleInvest(amountMXN);
      
      setTransactionDetails({
        hash: transactionHash,
        amountEth: amountEth,
        amountMxn: amountMXN,
      });

      setTransactionStep(1);
      toast("Transacción enviada. Esperando confirmación...", greenToastStyle);

      await refetchDeposits();

      setTransactionStep(2);
      toast.success("¡Inversión confirmada!", greenToastStyle);

      // No longer hiding the status automatically, ticket will be shown
      // setTimeout(() => {
      //   setShowTransactionStatus(false);
      //   setTransactionStep(-1);
      // }, 3000);
    } catch (error: any) {
      console.error(error);
      let errorMessage = "Error al procesar la inversión.";
      if (
        error.message.includes("User denied") ||
        error.message.includes("User rejected")
      ) {
        errorMessage = "Operación cancelada por el usuario.";
      }
      toast.error(errorMessage, greenToastStyle);
      setShowTransactionStatus(false);
      setTransactionStep(-1);
    }
  };

  return (
    <>
      <Card className="w-full max-w-md p-4 sm:p-8 animate-fadeIn relative">
        {onClose && (
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              zIndex: 20,
              background: "rgba(255,255,255,0.85)",
              borderRadius: "9999px",
              width: 24,
              height: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              boxShadow: "0 2px 8px #0002",
              cursor: "pointer"
            }}
            aria-label="Cerrar"
          >
            <span style={{fontSize: 16, fontWeight: 700, color: "#23272f"}}>×</span>
          </button>
        )}
        <CardContent className="mb-3">
          {showTransactionStatus ? (
            <InvestTransactionStatus
              currentStep={transactionStep}
              isVisible={showTransactionStatus}
              investmentAmountMXN={transactionDetails.amountMxn}
              investmentAmountETH={transactionDetails.amountEth}
              transactionHash={transactionDetails.hash}
              walletAddress={account.address}
              explorerUrl={activeChain?.blockExplorers?.[0]?.url}
            />
          ) : (
            <>
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

              <div className="flex items-center justify-center mb-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setAmountMXN((a) => Math.max(100, a - 100))}
                  disabled={amountMXN <= 100}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <div className="relative mx-2">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                    MXN
                  </span>
                  <Input
                    type="text"
                    min="100"
                    step="100"
                    value={amountMXN}
                    onChange={(e) =>
                      setAmountMXN(parseFloat(e.target.value) || 0)
                    }
                    className="w-32 text-center text-white bg-transparent pl-12"
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setAmountMXN((a) => a + 100)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="text-center text-xs text-zinc-400 font-mono mb-4">
                {depositedMXN === undefined ? (
                  <span>Cargando balance…</span>
                ) : depositedMXN > 0 ? (
                  <>
                    <div className="text-base font-semibold text-zinc-100">
                      Total en Pool: {depositedMXN.toFixed(2)} MXN
                    </div>
                    <div className="text-xs text-zinc-400 font-mono">
                      Tu posición actual
                    </div>
                  </>
                ) : (
                  <span className="text-base font-semibold text-zinc-100">
                    Aún no tienes capital invertido
                  </span>
                )}
              </div>
            </>
          )}
        </CardContent>

        <CardFooter className="flex-col items-center justify-center w-full">
          {!showTransactionStatus && (
            <>
              <button
                onClick={onInvestClick}
                disabled={isEthPriceLoading || isDepositing}
                className={`w-full font-mono text-white py-2 px-3 rounded-lg text-sm ${
                  isEthPriceLoading || isDepositing
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-600 to-green-300 hover:opacity-90"
                }`}
              >
                {isEthPriceLoading
                  ? "Cargando..."
                  : isDepositing
                  ? "Procesando..."
                  : `Invertir ${amountMXN} MXN`}
              </button>
              <div className="flex items-center justify-around w-full mt-4 font-mono text-sm">
                <button onClick={() => setInfoModalOpen(true)} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
                  <div className="border border-zinc-600 rounded-md p-1">
                    <Info className="h-4 w-4" />
                  </div>
                  <span>Info</span>
                </button>
                <button onClick={() => setMethodModalOpen(true)} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
                  <div className="border border-zinc-600 rounded-md p-1">
                    <Banknote className="h-4 w-4" />
                  </div>
                  <span>Método</span>
                </button>
                <button onClick={() => setGuideModalOpen(true)} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
                  <div className="border border-zinc-600 rounded-md p-1">
                    <Youtube className="h-4 w-4" />
                  </div>
                  <span>Guía</span>
                </button>
              </div>
            </>
          )}
        </CardFooter>
      </Card>

      <InfoModal isOpen={isInfoModalOpen} onClose={() => setInfoModalOpen(false)} title="Pool Family & Friends de Pandoras Foundation">
        <PoolInfoContent />
      </InfoModal>

      <InfoModal isOpen={isMethodModalOpen} onClose={() => setMethodModalOpen(false)} title="Método de Inversión">
        <p>Estás invirtiendo en MXN. Nuestra plataforma se encarga de convertir tu inversión a ETH de forma segura y transparente. Tus rendimientos también los recibirás en una moneda estable equivalente al dólar (USDC), protegiéndote de la volatilidad.</p>
      </InfoModal>

      <InfoModal
        isOpen={isGuideModalOpen}
        onClose={() => setGuideModalOpen(false)}
        title="Guía para Invertir"
      >
        {/* Web Video (16:9) */}
        <div className="hidden md:block" style={{ position: 'relative', paddingTop: '56.25%' }}>
          <iframe
            src="https://player.vimeo.com/video/1095296492?h=35fc873367&autoplay=1" // URL para web
            title="Vimeo video player"
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
          />
        </div>
        {/* Mobile Video (9:16) - Usando el mismo video por ahora */}
        <div className="block md:hidden" style={{ position: 'relative', paddingTop: '177.78%' }}>
          <iframe
            src="https://player.vimeo.com/video/1095296492?h=35fc873367&autoplay=1" // URL para mobile
            title="Vimeo video player"
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
          />
        </div>
</InfoModal>
    </>
  );
}
