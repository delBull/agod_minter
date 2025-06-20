"use client";

import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Download, Printer } from 'lucide-react';
import html2canvas from 'html2canvas';
import QRCode from "react-qr-code";
import Image from 'next/image';
import styles from './InvestmentTicket.module.css';
import { useWalletDetector } from '@/hooks/use-wallet-detector';

interface InvestmentTicketProps {
  transactionId: string;
  investmentAmountMXN: number;
  investmentAmountETH: number;
  investmentInfo: string;
  transactionHash: string;
  walletAddress: string;
  forceWalletOS?: 'iOS' | 'Android' | 'Other'; // Prop for Storybook
  explorerUrl?: string;
}

const InvestmentTicket: React.FC<InvestmentTicketProps> = ({
  transactionId,
  investmentAmountMXN,
  investmentAmountETH,
  investmentInfo,
  transactionHash,
  walletAddress,
  forceWalletOS,
  explorerUrl: propExplorerUrl,
}) => {
  const ticketRef = useRef<HTMLDivElement>(null);
  const explorerUrl = propExplorerUrl ? `${propExplorerUrl}/tx/${transactionHash}` : `https://basescan.org/tx/${transactionHash}`;
  const detectedOS = useWalletDetector();
  const walletOS = forceWalletOS || detectedOS;

  const handleDownload = () => {
    if (ticketRef.current) {
      html2canvas(ticketRef.current, { 
        useCORS: true, 
        backgroundColor: 'transparent',
      }).then((canvas) => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `pandoras-investment-${transactionId}.png`;
        link.click();
      });
    }
  };

  const ticketCss = `
  body { margin: 0; background: #1e1b4b; }
  .${styles.ticketWrapper} {
    background: linear-gradient(180deg, #23272f 60%, #a3e635 100%);
    border-radius: 20px;
    border: 4px solid #fff;
    box-shadow: 0 8px 32px #0005, inset 0 2px 24px #fff2;
    min-width: 320px;
    min-height: 520px;
    padding: 0;
    color: #fff;
    font-family: 'Inter', sans-serif;
  }
  a { color: #23272f; text-decoration: underline; }
`;

  const handlePrint = () => {
    if (ticketRef.current) {
        const printWindow = window.open('', '', 'height=800,width=800');
        if (printWindow) {
            printWindow.document.write('<html><head><title>Print Ticket</title>');
            printWindow.document.write(`<style>${ticketCss}</style>`);
            printWindow.document.write('</head><body style="background-color: #1f2937;">');
            printWindow.document.write(`<div class="${styles.ticketWrapper}">${ticketRef.current.innerHTML}</div>`);
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.print();
        }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={styles.ticketWrapper} ref={ticketRef}>
        {/* Ticket Body */}
        <div className={styles.ticketBody} style={{padding: 0}}>
          {/* Top Section - Gris oscuro */}
          <div
            className={styles.mainSection}
            style={{
              background: "#23272f",
              borderTopLeftRadius: "1rem",
              borderTopRightRadius: "1rem",
              padding: "1.5rem",
              position: "relative",
              //backgroundImage: "url('/agodworld.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: 1,
              overflow: "hidden",
            }}
          >
             
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: "url('/agodworld.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                opacity: 0.05,
                zIndex: 1,
                borderTopLeftRadius: "1rem",
                borderTopRightRadius: "1rem",
              }}
            />
            {/* Acciones */}
            <div
              className={styles.actions}
              style={{
                position: "absolute",
                top: "1.2rem",
                right: "1.2rem",
                zIndex: 10,
                display: "flex",
                gap: "0.5rem",
                background: "rgba(36,36,36,0.7)",
                borderRadius: "2rem",
                padding: "0.25rem 0.5rem",
                boxShadow: "0 2px 8px #0003"
              }}
            >
              <Button onClick={handleDownload} size="icon" variant="ghost" >
                <Download />
              </Button>
              <Button onClick={handlePrint} size="icon" variant="ghost" >
                <Printer />
              </Button>
              {walletOS === 'iOS' && (
                <Button size="icon" variant="ghost">
                  <Image src="https://upload.wikimedia.org/wikipedia/commons/4/44/Apple_Wallet_logo.svg" alt="Add to Apple Wallet" width={24} height={24} />
                </Button>
              )}
              {walletOS === 'Android' && (
                <Button size="icon" variant="ghost">
                  <Image src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Google_Wallet_logo.svg/512px-Google_Wallet_logo.svg.png" alt="Add to Google Wallet" width={24} height={24} />
                </Button>
              )}
            </div>

            {/* Logo y título */}
            <div className={styles.header} style={{ position: "relative", zIndex: 2 }}>
              <Image src="/pandoras/onlybox2.png" alt="Pandora's Box" width={60} height={60} className={styles.logo} />
            </div>
            <div className="text-center" style={{ position: "relative", zIndex: 2 }}>
              <h1 className={styles.title} style={{ color: "#fff" }}>PANDORA'S POOL</h1>
              <p className={styles.subtitle} style={{ color: "#fff", opacity: 0.85 }}>INVESTMENT CONFIRMATION</p>
            </div>

            {/* Detalles */}
            <div className={styles.detailsGrid} style={{ position: "relative", zIndex: 2 }}>
              <div className={styles.detailItem}>
                <p>AMOUNT (MXN)</p>
                <p>${investmentAmountMXN.toLocaleString()}</p>
              </div>
              <div className={styles.detailItem}>
                <p>AMOUNT (ETH)</p>
                <p>{investmentAmountETH.toFixed(6)}</p>
              </div>
              <div className={styles.detailItem} style={{ gridColumn: "span 2", marginTop: "0.5rem" }}>
                <p>INVESTMENT</p>
                <p>{investmentInfo}</p>
              </div>
              <div className={styles.detailItem} style={{ gridColumn: "span 2" }}>
                <p>WALLET</p>
                <p style={{ fontSize: "0.85em", wordBreak: "break-all" }}>{walletAddress}</p>
              </div>
            </div>
          </div>

          {/* Perforated Edge */}
          <div className={styles.perforatedEdge}>
            <div className={`${styles.perforationHole} ${styles.perforationHoleLeft}`}></div>
            <div className={`${styles.perforationHole} ${styles.perforationHoleRight}`}></div>
            <div className={styles.dashedLine}></div>
          </div>

          {/* Bottom Section - Verde lime */}
          <div
            className={styles.bottomSection}
            style={{
              background: "linear-gradient(180deg, #a3e635 0%, #65a30d 100%)",
              borderBottomLeftRadius: "1rem",
              borderBottomRightRadius: "1rem",
              padding: "2.2rem 1.5rem 1.5rem 1.5rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              position: "relative",
              minHeight: 180,
            }}
          >
            {/* QR centrado */}
            <div style={{ background: "rgba(255,255,255,0.85)", borderRadius: "0.75rem", padding: "0.75rem", marginBottom: "1rem", boxShadow: "0 2px 12px #0002" }}>
              <QRCode value={explorerUrl} size={100} bgColor="transparent" fgColor="#23272f" />
            </div>
            {/* Hash clickeable */}
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#23272f",
                fontSize: "0.85rem",
                wordBreak: "break-all",
                textDecoration: "underline",
                fontWeight: 600,
                marginBottom: "0.5rem",
                textAlign: "center",
                display: "block",
                maxWidth: 260,
              }}
            >
              {transactionHash}
            </a>
            {/* ID de transacción */}
            <div style={{ color: "#23272f", fontSize: "0.8rem", opacity: 0.7, marginTop: "0.5rem", textAlign: "center" }}>
              Transaction ID: {transactionId}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestmentTicket;