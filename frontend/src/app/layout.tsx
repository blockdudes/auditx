import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import SessionProviderWapper from "@/lib/providers/SessionProviderWrapper";
import StoreProvider from "@/lib/providers/ReduxProvider";
import ConnectWalletProvider from "@/lib/providers/WalletProvider";
import { Toaster } from 'react-hot-toast';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "AuditX",
  description: "AuditX",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <ConnectWalletProvider>
        <StoreProvider>
          <SessionProviderWapper>
            <body
              className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
              <Toaster />
              {children}
            </body>
          </SessionProviderWapper>
        </StoreProvider>
      </ConnectWalletProvider>
    </html>
  );
}
