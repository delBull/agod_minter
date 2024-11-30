import { CheckCircle2, Loader2, ArrowRight } from "lucide-react";

interface TransactionStatusProps {
    currentStep: number;
    isVisible: boolean;
}

export function TransactionStatus({ currentStep, isVisible }: TransactionStatusProps) {
    if (!isVisible) return null;

    return (
        <div className="flex flex-col items-center justify-center w-full space-y-4 my-4">
            <div className="flex flex-col items-center space-y-6 w-full max-w-xs">
                {/* Paso 0: Aprobación */}
                <div className="flex items-center justify-center w-full">
                    <div className={`flex items-center ${currentStep >= 0 ? 'text-purple-500' : 'text-zinc-600'}`}>
                        {currentStep === 0 ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : currentStep > 0 ? (
                            <CheckCircle2 className="h-5 w-5" />
                        ) : (
                            <div className="h-5 w-5 rounded-full border-2 border-current" />
                        )}
                        <span className="ml-2 text-sm font-mono">Iniciando Transacción</span>
                    </div>
                </div>

                {/* Flecha */}
                <ArrowRight className="h-4 w-4 text-zinc-600 rotate-90" />

                {/* Paso 1: Enviando */}
                <div className="flex items-center justify-center w-full">
                    <div className={`flex items-center ${currentStep >= 1 ? 'text-purple-500' : 'text-zinc-600'}`}>
                        {currentStep === 1 ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : currentStep > 1 ? (
                            <CheckCircle2 className="h-5 w-5" />
                        ) : (
                            <div className="h-5 w-5 rounded-full border-2 border-current" />
                        )}
                        <span className="ml-2 text-sm font-mono">Enviando a la Blockchain</span>
                    </div>
                </div>

                {/* Flecha */}
                <ArrowRight className="h-4 w-4 text-zinc-600 rotate-90" />

                {/* Paso 2: Confirmación */}
                <div className="flex items-center justify-center w-full">
                    <div className={`flex items-center ${currentStep >= 2 ? 'text-purple-500' : 'text-zinc-600'}`}>
                        {currentStep === 2 ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : currentStep > 2 ? (
                            <CheckCircle2 className="h-5 w-5" />
                        ) : (
                            <div className="h-5 w-5 rounded-full border-2 border-current" />
                        )}
                        <span className="ml-2 text-sm font-mono">Confirmando Transacción</span>
                    </div>
                </div>

                {/* Flecha */}
                <ArrowRight className="h-4 w-4 text-zinc-600 rotate-90" />

                {/* Paso 3: Completado */}
                <div className="flex items-center justify-center w-full">
                    <div className={`flex items-center ${currentStep >= 3 ? 'text-green-500' : 'text-zinc-600'}`}>
                        {currentStep === 3 ? (
                            <CheckCircle2 className="h-5 w-5" />
                        ) : (
                            <div className="h-5 w-5 rounded-full border-2 border-current" />
                        )}
                        <span className="ml-2 text-sm font-mono">Transacción Completada</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
