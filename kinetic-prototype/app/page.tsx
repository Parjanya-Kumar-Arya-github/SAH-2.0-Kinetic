"use client";

import { useMemo } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { Send } from "lucide-react";

function StatusBadge() {
  const { connected } = useWallet();

  const status = useMemo(
    () =>
      connected
        ? { label: "HYDRATED", color: "bg-emerald-500", pulse: true }
        : { label: "STATELESS", color: "bg-rose-500", pulse: false },
    [connected]
  );

  return (
    <div className="flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-200 shadow-[0_0_0_1px_rgba(15,23,42,0.8)] backdrop-blur-md">
      <span
        className={`relative inline-flex h-2 w-2 rounded-full ${status.color} ${
          status.pulse ? "animate-ping-slow" : ""
        }`}
      >
        <span className="absolute inset-0 rounded-full bg-slate-900/70" />
      </span>
      <span className="text-[0.7rem]">{status.label}</span>
    </div>
  );
}

export default function Home() {
  const { publicKey } = useWallet();

  const activeWalletDisplay = useMemo(() => {
    if (!publicKey) return "<Disconnected>";
    const base58 = publicKey.toBase58();
    if (base58.length <= 8) return base58;
    return `${base58.slice(0, 4)}...${base58.slice(-4)}`;
  }, [publicKey]);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900 text-slate-50">
      <div className="pointer-events-none fixed inset-0 opacity-60 mix-blend-screen">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(56,189,248,0.18),transparent_55%),radial-gradient(circle_at_100%_0%,rgba(110,231,183,0.16),transparent_50%),radial-gradient(circle_at_0%_100%,rgba(244,63,94,0.12),transparent_45%)]" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col px-4 py-4 sm:px-6 sm:py-6 lg:px-10 lg:py-8">
        <header className="mb-4 flex items-center justify-between rounded-2xl border border-slate-800/80 bg-slate-900/70 px-4 py-3 shadow-[0_0_40px_rgba(15,23,42,0.7)] backdrop-blur-xl sm:mb-6 sm:px-5 sm:py-4">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[0.7rem] font-medium uppercase tracking-[0.25em] text-sky-400/80">
                KINETIC
              </span>
              <div className="flex items-baseline gap-3">
                <h1 className="text-lg font-semibold tracking-wide text-slate-50 sm:text-xl">
                  Sovereign State
                </h1>
                <span className="hidden text-[0.7rem] uppercase tracking-[0.22em] text-slate-500 sm:inline">
                  // Decoupled Memory Vector
                </span>
              </div>
            </div>
            <StatusBadge />
          </div>

          <div className="flex items-center gap-3">
            <WalletMultiButton className="wallet-adapter-button-trigger rounded-full border border-slate-700 bg-slate-900/80 px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-100 shadow-[0_0_24px_rgba(8,47,73,0.85)] transition-transform hover:-translate-y-px hover:border-sky-500/60 hover:bg-slate-900/90 hover:text-sky-100" />
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-4 lg:flex-row lg:gap-6">
          <section className="flex h-[60vh] flex-1 flex-col overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/70 shadow-[0_0_40px_rgba(15,23,42,0.75)] backdrop-blur-2xl sm:h-[70vh]">
            <div className="border-b border-slate-800/80 px-4 py-3 sm:px-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="inline-flex h-2 w-2 rounded-full bg-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.9)]" />
                  <span className="uppercase tracking-[0.18em]">
                    Agent Console
                  </span>
                </div>
                <span className="text-[0.65rem] font-medium text-slate-500">
                  Devnet · Stateless Compute
                </span>
              </div>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
              <div className="flex items-start gap-3">
                <div className="mt-1 h-7 w-7 shrink-0 rounded-full border border-slate-700 bg-slate-900/80 ring-2 ring-sky-700/50" />
                <div className="max-w-xl rounded-2xl bg-slate-900/90 px-4 py-3 text-sm text-slate-100 shadow-[0_0_32px_rgba(15,23,42,0.8)] ring-1 ring-sky-900/60">
                  <p className="leading-relaxed">
                    Agent initialized. No state detected. Please connect wallet
                    to inject memory vector.
                  </p>
                  <p className="mt-2 text-[0.7rem] uppercase tracking-[0.22em] text-slate-500">
                    KINETIC // PROTOCOL HANDSHAKE
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <div className="flex max-w-xl items-end gap-3">
                  <div className="rounded-2xl bg-gradient-to-br from-sky-500/90 via-sky-400/85 to-emerald-400/85 px-4 py-3 text-sm text-slate-950 shadow-[0_0_40px_rgba(56,189,248,0.85)] ring-1 ring-sky-300/70">
                    <p className="leading-relaxed">
                      [Wallet Connected - Initiating Decryption]
                    </p>
                    <p className="mt-2 text-[0.7rem] uppercase tracking-[0.22em] text-slate-900/70">
                      USER // SOVEREIGN STATE
                    </p>
                  </div>
                  <div className="mb-1 h-7 w-7 shrink-0 rounded-full bg-gradient-to-br from-sky-500 to-emerald-400 ring-2 ring-sky-300/70" />
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 h-7 w-7 shrink-0 rounded-full border border-slate-700 bg-slate-900/80 ring-2 ring-emerald-500/50" />
                <div className="max-w-xl rounded-2xl bg-slate-900/95 px-4 py-3 text-sm text-slate-100 shadow-[0_0_36px_rgba(8,47,73,0.85)] ring-1 ring-emerald-900/60">
                  <p className="leading-relaxed">
                    Context hydrated from IPFS. Welcome back. I have loaded
                    your preferences. How can I assist you today?
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[0.7rem] uppercase tracking-[0.22em] text-emerald-400/80">
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-emerald-300">
                      Vector State: Online
                    </span>
                    <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-sky-300">
                      IPFS: Hydrated
                    </span>
                    <span className="rounded-full bg-fuchsia-500/10 px-2 py-0.5 text-fuchsia-300">
                      AES-256: Derived
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800/80 bg-slate-950/80 px-4 py-3 sm:px-6">
              <div className="flex items-center justify-between text-[0.7rem] text-slate-500">
                <span className="uppercase tracking-[0.22em]">
                  Sovereign AI · Non-custodial memory
                </span>
                <span className="hidden md:inline">
                  Devnet prototype – not production ready
                </span>
              </div>
            </div>
          </section>

          <aside className="mt-2 flex w-full max-w-full flex-col rounded-2xl border border-slate-800/80 bg-slate-950/80 shadow-[0_0_32px_rgba(15,23,42,0.8)] backdrop-blur-2xl lg:mt-0 lg:w-80">
            <div className="flex items-center justify-between border-b border-slate-800/80 px-4 py-3 sm:px-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Vector State Engine
                </p>
                <p className="mt-0.5 text-[0.7rem] text-slate-500">
                  Debug · Hackathon Overlay
                </p>
              </div>
              <div className="flex items-center gap-1">
                <span className="inline-flex h-1.5 w-5 rounded-full bg-emerald-500/80 shadow-[0_0_10px_rgba(16,185,129,0.9)]" />
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3 text-xs font-mono text-slate-300 sm:px-5 sm:py-4">
              <div className="rounded-lg border border-slate-800/90 bg-slate-950/80 p-3 shadow-inner shadow-slate-950">
                <p className="mb-1 text-[0.7rem] text-sky-300">
                  $ state-engine --inspect
                </p>
                <div className="space-y-1.5 text-[0.7rem] leading-relaxed">
                  <p className="text-slate-400">
                    &gt; Active Wallet:{" "}
                    <span className="text-slate-100">{activeWalletDisplay}</span>
                  </p>
                  <p className="text-slate-400">
                    &gt; AES-256 Key:{" "}
                    <span className="text-emerald-300">Derived</span>
                  </p>
                  <p className="text-slate-400">
                    &gt; IPFS CID:{" "}
                    <span className="text-sky-300">Qm...xYk</span>
                  </p>
                  <p className="text-slate-400">
                    &gt; Solana Transfer Hook:{" "}
                    <span className="text-fuchsia-300">Active</span>
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-slate-800/90 bg-slate-950/90 p-3">
                <p className="mb-1 text-[0.7rem] text-emerald-300">
                  telemetry::stream
                </p>
                <div className="space-y-1.5 text-[0.7rem] text-slate-400">
                  <p>[devnet] listening for state diffs...</p>
                  <p>
                    [hook] &gt; transfer:{" "}
                    <span className="text-emerald-300">
                      0.01 SOL · ACK
                    </span>
                  </p>
                  <p>
                    [vector] &gt; ipfs.hydrate(cid=Qm...xYk) ·{" "}
                    <span className="text-sky-300">OK</span>
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-slate-900 bg-slate-950/90 p-3 text-[0.68rem] text-slate-500">
                <p className="mb-1 uppercase tracking-[0.22em] text-slate-400">
                  Notes
                </p>
                <p>
                  All state is user-signed and vectorized off-chain. Wallet
                  controls memory, not the model.
                </p>
              </div>
            </div>
          </aside>
        </main>

        <section className="relative z-20 mt-4">
          <div className="mx-auto max-w-4xl">
            <div className="relative rounded-2xl border border-slate-800/80 bg-slate-950/80 px-3 py-2 shadow-[0_0_40px_rgba(15,23,42,0.92)] backdrop-blur-2xl sm:px-4 sm:py-3">
              <div className="pointer-events-none absolute inset-x-10 -top-10 h-10 bg-gradient-to-b from-sky-500/20 via-sky-500/0 to-transparent blur-3xl" />
              <div className="relative flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Query your sovereign AI..."
                  className="h-11 flex-1 rounded-full border border-slate-800/80 bg-slate-950/90 px-4 text-sm text-slate-100 placeholder:text-slate-600 outline-none ring-0 transition focus:border-sky-500/80 focus:bg-slate-950 focus:ring-1 focus:ring-sky-500/70 sm:h-12 sm:text-sm"
                />
                <button
                  type="button"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 via-sky-400 to-emerald-400 text-slate-950 shadow-[0_0_32px_rgba(56,189,248,0.9)] transition hover:-translate-y-px hover:shadow-[0_0_40px_rgba(56,189,248,1)] sm:h-12 sm:w-12"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

