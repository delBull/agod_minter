import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AGOD Token Minter",
  description: "Mint your AGOD tokens",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <main className="min-h-screen bg-black">
            {children}
          </main>
          <Toaster 
            position="top-right"
            theme="dark"
            closeButton
            richColors
            toastOptions={{
              style: {
                background: '#333',
                color: '#fff',
                border: '1px solid #444'
              },
              duration: 5000
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
