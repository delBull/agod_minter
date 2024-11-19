"use client";

import { ThirdwebProvider } from "thirdweb/react";
import { sepoliaChain } from "@/lib/chains";
import { useEffect } from "react";

function ConnectionLogger({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // Log initialization header
        console.log("%c=== ThirdwebProvider Initialization ===", "font-weight: bold; font-size: 14px;");
        
        // Log basic chain details
        console.log("%cChain Details", "font-weight: bold; color: blue;");
        console.log("  ID:", sepoliaChain.id);
        console.log("  Name:", sepoliaChain.name);
        console.log("  RPC URL:", sepoliaChain.rpc);
        console.log("  Testnet:", sepoliaChain.testnet);
        
        // Log native currency if available
        if (sepoliaChain.nativeCurrency) {
            console.log("%cNative Currency", "font-weight: bold; color: blue;");
            console.log("  Name:", sepoliaChain.nativeCurrency.name);
            console.log("  Symbol:", sepoliaChain.nativeCurrency.symbol);
            console.log("  Decimals:", sepoliaChain.nativeCurrency.decimals);
        }
        
        // Log block explorers if available
        if (sepoliaChain.blockExplorers?.length) {
            console.log("%cBlock Explorers", "font-weight: bold; color: blue;");
            sepoliaChain.blockExplorers.forEach((explorer, index) => {
                console.log(`  ${index + 1}. ${explorer.name}`);
                console.log("     URL:", explorer.url);
                console.log("     API:", explorer.apiUrl);
            });
        }
        
        // Log chain ID formats
        console.log("%cChain ID Formats", "font-weight: bold; color: blue;");
        console.log("  Decimal:", sepoliaChain.id);
        console.log("  Hex:", `0x${sepoliaChain.id.toString(16)}`);
        console.log("  String:", sepoliaChain.id.toString());
        
        // Log environment details
        console.log("%cEnvironment", "font-weight: bold; color: blue;");
        console.log("  Development:", process.env.NODE_ENV === 'development');
        console.log("  Production:", process.env.NODE_ENV === 'production');
        console.log("  Has MetaMask:", typeof window !== 'undefined' && !!window.ethereum);
        console.log("  Time:", new Date().toISOString());

        // Log initialization complete
        console.log("%c=== Initialization Complete ===", "font-weight: bold; font-size: 14px;");
    }, []);

    return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThirdwebProvider>
            <ConnectionLogger>
                {children}
            </ConnectionLogger>
        </ThirdwebProvider>
    );
}
