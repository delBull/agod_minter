import { useSpring, animated } from "react-spring";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { cn } from "@/lib/utils";

type TransactionStep = {
  status: "pending" | "active" | "completed";
  icon: React.ReactNode;
  label: string;
};

interface TransactionStatusProps {
  currentStep: number;
  isVisible: boolean;
}

export function TransactionStatus({ currentStep, isVisible }: TransactionStatusProps) {
  const fadeIn = useSpring({
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? "translateY(0)" : "translateY(20px)",
  });

  const steps: TransactionStep[] = [
    {
      status: currentStep >= 0 ? currentStep === 0 ? "active" : "completed" : "pending",
      icon: <Loader2 className="h-6 w-6 animate-spin" />,
      label: "Iniciando transacción"
    },
    {
      status: currentStep >= 1 ? currentStep === 1 ? "active" : "completed" : "pending",
      icon: <Send className="h-6 w-6" />,
      label: "Enviando a la blockchain"
    },
    {
      status: currentStep >= 2 ? currentStep === 2 ? "active" : "completed" : "pending",
      icon: <Loader2 className="h-6 w-6 animate-spin" />,
      label: "Procesando"
    },
    {
      status: currentStep >= 3 ? "completed" : "pending",
      icon: <CheckCircle2 className="h-6 w-6" />,
      label: "Completado"
    }
  ];

  return (
    <animated.div style={fadeIn} className="w-full max-w-md mx-auto">
      <div className="space-y-4 mt-4">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center space-x-4">
            <div
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full transition-colors",
                step.status === "completed" && "bg-green-500/20 text-green-500",
                step.status === "active" && "bg-blue-500/20 text-blue-500",
                step.status === "pending" && "bg-zinc-800/50 text-zinc-500"
              )}
            >
              {step.icon}
            </div>
            <div
              className={cn(
                "flex-1 text-sm font-medium transition-colors",
                step.status === "completed" && "text-green-500",
                step.status === "active" && "text-blue-500",
                step.status === "pending" && "text-zinc-500"
              )}
            >
              {step.label}
            </div>
          </div>
        ))}
      </div>
    </animated.div>
  );
}
