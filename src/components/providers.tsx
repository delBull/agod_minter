"use client";

import { ThirdwebProvider } from "thirdweb/react";
import { inAppWallet, createWallet } from "thirdweb/wallets";
import { baseChain } from "@/lib/chains";
import { useEffect, useState } from "react";
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000,
    },
  },
});


function ConnectionLogger({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // Log initialization header
        console.log("%c=== ThirdwebProvider Initialization ===", "font-weight: bold; font-size: 14px;");
        
        // Log basic chain details
        console.log("%cChain Details", "font-weight: bold; color: blue;");
        console.log("  ID:", baseChain.id);
        console.log("  Name:", baseChain.name);
        console.log("  RPC URL:", baseChain.rpc);
        console.log("  Testnet:", baseChain.testnet);
        
        // Log native currency if available
        if (baseChain.nativeCurrency) {
            console.log("%cNative Currency", "font-weight: bold; color: blue;");
            console.log("  Name:", baseChain.nativeCurrency.name);
            console.log("  Symbol:", baseChain.nativeCurrency.symbol);
            console.log("  Decimals:", baseChain.nativeCurrency.decimals);
        }
        
        // Log block explorers if available
        if (baseChain.blockExplorers?.length) {
            console.log("%cBlock Explorers", "font-weight: bold; color: blue;");
            baseChain.blockExplorers.forEach((explorer, index) => {
                console.log(`  ${index + 1}. ${explorer.name}`);
                console.log("     URL:", explorer.url);
                console.log("     API:", explorer.apiUrl);
            });
        }
        
        // Log chain ID formats
        console.log("%cChain ID Formats", "font-weight: bold; color: blue;");
        console.log("  Decimal:", baseChain.id);
        console.log("  Hex:", `0x${baseChain.id.toString(16)}`);
        console.log("  String:", baseChain.id.toString());
        
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
    const [isReady, setIsReady] = useState(false);
    const reCaptchaKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;

    useEffect(() => {
        if (clientId) {
            setIsReady(true);
        } else {
            console.error('NEXT_PUBLIC_THIRDWEB_CLIENT_ID is not configured');
        }
    }, [clientId]);

    if (!isReady) {
        return <div>Loading providers...</div>;
    }

    return (
        <QueryClientProvider client={queryClient}>
        <GoogleReCaptchaProvider
            reCaptchaKey={reCaptchaKey || ''}
            scriptProps={{
                async: true,
                defer: true,
                appendTo: 'head',
            }}
            container={{
                parameters: {
                    badge: 'bottomright',
                    theme: 'dark',
                },
            }}
            useRecaptchaNet={true}
            language="es"
        >
            <ThirdwebProvider>
                <ConnectionLogger>
                    {children}
                </ConnectionLogger>
            </ThirdwebProvider>
        </GoogleReCaptchaProvider>
      </QueryClientProvider>
    );
}
