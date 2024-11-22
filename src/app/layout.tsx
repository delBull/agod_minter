import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "sonner";
import { Footer } from "@/components/Footer";

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
      <body className={`${inter.className} bg-black`}>
        <Providers>
          <div className="relative h-screen bg-black overflow-hidden">
            <div className="h-full p-4 md:p-8 max-w-7xl mx-auto w-full">
              <main>
                {children}
              </main>
              <Footer />
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
