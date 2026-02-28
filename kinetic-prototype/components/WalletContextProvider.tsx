// WalletContextProvider.tsx
// This component initializes the Solana wallet connection environment for the dApp.
// It sets up the network connection (Devnet) and provides standard wallet adapters
// (Phantom, Solflare) to allow users to authenticate and interact with the application.

"use client";

import { useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
} from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import type { ReactNode } from "react";

type WalletContextProviderProps = {
  children: ReactNode;
};

export function WalletContextProvider({ children }: WalletContextProviderProps) {
  // Establish connection to the Solana Devnet cluster.
  // In a production app, you might use 'mainnet-beta' or a custom RPC endpoint.
  const endpoint = useMemo(() => clusterApiUrl("devnet"), []);

  // Initialize supported wallet connect adapters.
  // These adapters handle the specific communication protocols for each wallet extension.
  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    []
  );

  return (
    // ConnectionProvider provides the connection object to the rest of the app for RPC calls.
    <ConnectionProvider endpoint={endpoint}>
      {/* WalletProvider manages the wallet state (connected, disconnecting, etc.) and auto-connect behavior. */}
      <WalletProvider wallets={wallets} autoConnect>
        {/* WalletModalProvider injects the UI dropdown/modal allowing users to select their wallet. */}
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

