import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "sonner";
import MetaPixel from '@/components/MetaPixel';

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
    <html lang="en" className="bg-black">
      <head>
        <noscript><img height="1" width="1" style={{display: 'none'}}
        src="https://www.facebook.com/tr?id=1783751072459748&ev=PageView&noscript=1"
        /></noscript>
      </head>
      <body className={`${inter.className} bg-black`}>
      <MetaPixel />
        <Providers>
          <div className="min-h-screen bg-black relative flex flex-col">
            <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
              <main>
                {children}
              </main>
            </div>
          </div>
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
