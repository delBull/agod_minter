"use client";

import { ThirdwebProvider } from "thirdweb/react";
import { fantomChain } from "@/lib/chains";
import { useEffect } from "react";
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

function ConnectionLogger({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // Log initialization header
        console.log("%c=== ThirdwebProvider Initialization ===", "font-weight: bold; font-size: 14px;");
        
        // Log basic chain details
        console.log("%cChain Details", "font-weight: bold; color: blue;");
        console.log("  ID:", fantomChain.id);
        console.log("  Name:", fantomChain.name);
        console.log("  RPC URL:", fantomChain.rpc);
        console.log("  Testnet:", fantomChain.testnet);
        
        // Log native currency if available
        if (fantomChain.nativeCurrency) {
            console.log("%cNative Currency", "font-weight: bold; color: blue;");
            console.log("  Name:", fantomChain.nativeCurrency.name);
            console.log("  Symbol:", fantomChain.nativeCurrency.symbol);
            console.log("  Decimals:", fantomChain.nativeCurrency.decimals);
        }
        
        // Log block explorers if available
        if (fantomChain.blockExplorers?.length) {
            console.log("%cBlock Explorers", "font-weight: bold; color: blue;");
            fantomChain.blockExplorers.forEach((explorer, index) => {
                console.log(`  ${index + 1}. ${explorer.name}`);
                console.log("     URL:", explorer.url);
                console.log("     API:", explorer.apiUrl);
            });
        }
        
        // Log chain ID formats
        console.log("%cChain ID Formats", "font-weight: bold; color: blue;");
        console.log("  Decimal:", fantomChain.id);
        console.log("  Hex:", `0x${fantomChain.id.toString(16)}`);
        console.log("  String:", fantomChain.id.toString());
        
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
    const reCaptchaKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

    if (!reCaptchaKey) {
        console.error('NEXT_PUBLIC_RECAPTCHA_SITE_KEY is not configured');
    }

    return (
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
    );
}
