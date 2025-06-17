import * as React from "react";
import { CheckCircle2, Loader2, ChevronRight, Coins } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TransactionStatusProps {
    currentStep: number;
    isVisible: boolean;
}

export function TransactionStatus({ currentStep, isVisible }: TransactionStatusProps) {
    if (!isVisible) return null;

    const steps = [
        { step: 0, label: "Enviando", icon: currentStep >= 0 ? <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4" /> : <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" /> },
        { step: 1, label: "Aprobando", icon: currentStep >= 1 ? <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4" /> : <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" /> },
        { step: 2, label: "Preparando", icon: currentStep >= 2 ? <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4" /> : <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" /> },
        { 
            step: 3, 
            label: "Completado!", 
            icon: currentStep === 3 ? (
                <>
                    <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ 
                            type: "spring",
                            stiffness: 260,
                            damping: 20
                        }}
                    >
                        <Coins className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 animate-bounce" />
                    </motion.div>
                </>
            ) : <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
        }
    ];

    return (
        <AnimatePresence>
            <motion.div 
                className="flex flex-col items-center space-y-2 sm:space-y-4 mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
            >
                <div className="flex items-center space-x-1 sm:space-x-2">
                    {steps.map((step, index) => (
                        <React.Fragment key={step.step}>
                            <span className={`text-[10px] sm:text-xs flex items-center gap-1 sm:gap-2 ${currentStep >= step.step ? 'text-green-500' : 'text-gray-400'}`}>
                                {step.icon}
                                <span className="hidden xs:inline">{step.label}</span>
                            </span>
                            {index < steps.length - 1 && (
                                <ChevronRight className="h-2 w-2 sm:h-3 sm:w-3 text-gray-400" />
                            )}
                        </React.Fragment>
                    ))}
                </div>
                {currentStep === 3 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[10px] sm:text-xs text-green-500 font-medium"
                    >
                        ¡Tokens agregados a tu wallet! 💰
                    </motion.div>
                )}
            </motion.div>
        </AnimatePresence>
    );
}
