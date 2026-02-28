import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@solana/wallet-adapter-react-ui/styles.css";
import "./globals.css";
import { WalletContextProvider } from "@/components/WalletContextProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
// layout.tsx
// This file serves as the Root Layout for the Next.js application.
// It wraps the entire application with global styles, fonts, and critical context providers.

export const metadata: Metadata = {
  title: "KINETIC - by Erastus",
  description:
    "Kinetic – a decentralized AI protocol that decouples compute from user memory state.",
  icons: {
    icon: "/logo.png",
  },
  manifest: "/manifest.json",
  themeColor: "#4f46e5",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-950 text-slate-50`}
      >
        {/*
          WalletContextProvider wraps the app to provide Solana wallet connection state.
          This is the foundational layer that allows Kinetic to link a physical wallet 
          to the simulated on-chain/IPFS state vector.
        */}
        <WalletContextProvider>{children}</WalletContextProvider>
      </body>
    </html>
  );
}

