import { CheckCircle2, Loader2, ArrowRight, ChevronRight, Coins } from "lucide-react";

interface TransactionStatusProps {
    currentStep: number;
    isVisible: boolean;
}

export function TransactionStatus({ currentStep, isVisible }: TransactionStatusProps) {
    if (!isVisible) return null;

    return (
        <div className="flex flex-col items-center space-y-2">
            <div className="flex items-center space-x-2">
                <span className={`text-xs ${currentStep >= 1 ? 'text-green-500' : 'text-gray-400'}`}>
                    Verificación
                </span>
                <ChevronRight className="h-3 w-3 text-gray-400" />
                <span className={`text-xs ${currentStep >= 2 ? 'text-green-500' : 'text-gray-400'}`}>
                    Preparación
                </span>
                <ChevronRight className="h-3 w-3 text-gray-400" />
                <span className={`text-xs ${currentStep >= 3 ? 'text-green-500' : 'text-gray-400'}`}>
                    {currentStep === 3 ? (
                        <span className="flex items-center gap-1">
                            Completado <Coins className="h-3 w-3" />
                        </span>
                    ) : 'Completado'}
                </span>
            </div>
            {currentStep === 3 && (
                <div className="text-xs text-green-500 animate-pulse">
                    ¡Tokens agregados a tu wallet! 💰
                </div>
            )}
        </div>
    );
}
