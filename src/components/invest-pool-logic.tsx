"use client";

import { toast } from "sonner";
import { useActiveAccount, ClaimButton } from "thirdweb/react";
import { BaseSepoliaTestnet } from "@/lib/chains";
import { client } from "@/lib/thirdwebClient";
import { CONTRACTS } from "@/lib/constants";

export const useInvestPoolLogic = () => {
  const account = useActiveAccount();

  const InvestButton = (amount: number) => {
    // Como InvestPool no se renderiza sin conexión, esta comprobación no es estricta
    if (!account) return null;

    return (
      <ClaimButton
        contractAddress={CONTRACTS.USDC_SEPOLIA}
        chain={BaseSepoliaTestnet}
        client={client}
        claimParams={{
          type: "ERC20",
          to: CONTRACTS.POOL_SEPOLIA,
          amount: (amount * 10 ** 6).toString(),
        }}
        onSuccess={() => toast.success("Inversión confirmada")}
        onError={(e) => {
          console.error(e);
          toast.error("Error en inversión");
        }}
        style={{
          width: "100%",
          background: "linear-gradient(to right, #22c55e, #16a34a)",
          color: "white",
          padding: "10px",
          borderRadius: "0.5rem",
        }}
      >
        Invertir {amount} USDC
      </ClaimButton>
    );
  };

  return { InvestButton };
};
