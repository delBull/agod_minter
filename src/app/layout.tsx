import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "sonner";
import MetaPixel from '@/components/MetaPixel';

const inter = Inter({ subsets: ["latin"] });

const siteConfig = {
  name: "AGOD Token Minter",
  description: "Participate in the AGOD Ecosystem by minting your AGOD tokens. Join our community and be part of the future of decentralized governance.",
  url: "https://minter.agodecosystem.com",
  ogImage: "https://minter.agodecosystem.com/agodfull.png",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | AGOD Ecosystem`,
  },
  description: siteConfig.description,
  keywords: ["AGOD", "Ecosystem", "Token", "Minter", "Crypto", "Blockchain", "Web3"],
  authors: [{ name: "AGOD Team", url: siteConfig.url }],
  creator: "AGOD Team",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
  icons: {
    icon: "/icon.png",
    shortcut: "/favicon.ico",
    apple: "/icon.png",
  },
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
