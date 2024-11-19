import { ThirdwebAuth } from "@thirdweb-dev/auth/next";
import { PrivateKeyWallet } from "@thirdweb-dev/auth/evm";
import { NextRequest, NextResponse } from "next/server";

const wallet = new PrivateKeyWallet(process.env.THIRDWEB_AUTH_PRIVATE_KEY || "");
const domain = process.env.NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN || "";

const { ThirdwebAuthHandler } = ThirdwebAuth({
    domain,
    wallet,
    callbacks: {
        onLogin: async (address: string) => {
            console.log("User logged in:", address);
            return { success: true };
        },
        onUser: async (user: { address: string; [key: string]: any }) => {
            console.log("User data:", user);
            return user;
        },
    },
});

// Export the handler directly for both GET and POST
export { ThirdwebAuthHandler as GET, ThirdwebAuthHandler as POST };

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}
