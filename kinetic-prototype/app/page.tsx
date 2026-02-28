"use client";

import { useMemo, useState, useEffect } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { Send, Cloud, Sun, Moon } from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

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
    <div className="flex items-center gap-2 rounded-full border border-[var(--border-color)] bg-[var(--card-bg)] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-[var(--foreground)] shadow-sm backdrop-blur-md">
      <span
        className={`relative inline-flex h-2 w-2 rounded-full ${status.color} ${status.pulse ? "animate-pulse" : ""
          }`}
      >
        <span className="absolute inset-0 rounded-full bg-current opacity-75" />
      </span>
      <span className="text-[0.7rem]">{status.label}</span>
    </div>
  );
}

// ----------------------------------------------------------------------------
// HOME PAGE COMPONENT
// This is the core interface for KINETIC. It handles the wallet connection,
// the simulated IPFS sync toggle, local memory vault management, and chat UI.
// ----------------------------------------------------------------------------
export default function Home() {
  // 1. STATE MANAGEMENT
  // Extracts the connected user's public key from the Solana wallet adapter
  const { publicKey } = useWallet();

  const [isMounted, setIsMounted] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isIpfsSynced, setIsIpfsSynced] = useState(false); // Controls whether AI sees memory
  const [vaultMemories, setVaultMemories] = useState<any[]>([]);
  // 2. THEME AND UI STATE
  // Manages the dark/light mode preference, persisting it to localStorage.
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('kinetic-theme', newTheme);

    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  };

  // 3. AUDIO FEEDBACK
  // Generates a synthesized "hydration" sound when the wallet connects and state is loaded.
  const playHydrationSound = () => {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.3);
  };

  // 4. INITIALIZATION (Theme & Visuals)
  useEffect(() => {
    const savedTheme = localStorage.getItem('kinetic-theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      }
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }

    // Load the custom CSS Houdini paint worklet for the dynamic background animation
    if (typeof window !== 'undefined' && 'paintWorklet' in (CSS as any)) {
      try {
        (CSS as any).paintWorklet.addModule('https://unpkg.com/css-houdini-ringparticles/dist/ringparticles.js');
      } catch (e) {
        console.error("Failed to load Houdini Worklet", e);
      }
    }
    setIsMounted(true);
  }, []);

  // 5. MEMORY PARSING (Neural Identity)
  // Scans the local vault for specific phrases to extract the user's name for a personalized UI.
  const userName = useMemo(() => {
    for (const mem of vaultMemories) {
      const match = mem.fact.match(/(?:my name is|i am|i'm called)\s+([A-Za-z]+)/i);
      if (match && match[1]) {
        return match[1].toUpperCase();
      }
    }
    return null;
  }, [vaultMemories]);

  const activeWalletDisplay = useMemo(() => {
    if (!publicKey) return "AWAITING IDENTITY";

    if (userName) {
      return (
        <span className="text-emerald-600 font-bold drop-shadow-sm tracking-wider">
          ID: {userName}
        </span>
      );
    }

    const base58 = publicKey.toBase58();
    if (base58.length <= 8) return base58;
    return `${base58.slice(0, 4)}...${base58.slice(-4)}`;
  }, [publicKey, userName]);

  // 6. AI CHAT INTEGRATION
  // Initializes the Vercel AI SDK chat interface pointing to our custom Groq endpoint.
  const { messages, status, sendMessage } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });

  const [input, setInput] = useState("");
  const isLoading = status === "submitted" || status === "streaming";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  // 7. CORE KINETIC WORKFLOW (The "Sovereign Submit")
  // This interceptor handles user messages before they reach the AI.
  // It writes the user's message to the local storage vault (acting as a decentralized memory vector)
  // and then forwards the message AND the entire vault state to the AI backend.
  const onSovereignSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const currentInput = input || "";
    if (!currentInput.trim() || isLoading || !publicKey) return;

    // A. Read existing state
    const vaultKey = `kinetic_vault_${publicKey.toBase58()}`;
    const currentVault = JSON.parse(localStorage.getItem(vaultKey) || "[]");

    // B. Append new memory and save locally
    const updatedVault = [...currentVault, { fact: currentInput.trim(), timestamp: Date.now() }];
    localStorage.setItem(vaultKey, JSON.stringify(updatedVault));
    setVaultMemories(updatedVault);

    // C. Dispatch to LLM with full context payload
    sendMessage({
      text: input.trim()
    }, {
      body: {
        walletAddress: publicKey.toBase58(),
        memoryVault: isIpfsSynced ? updatedVault : [], // Only send memory if "synced"
        ipfsStatus: isIpfsSynced ? 'connected' : 'disconnected'
      }
    });
    setInput("");
  };

  // 8. IPFS SIMULATION
  // Simulates the delay of pinning the local state to IPFS.
  const handleIpfsSync = () => {
    setIsSyncing(true);

    setTimeout(() => {
      setIsSyncing(false);
      setIsIpfsSynced(true);
    }, 2000);
  };

  // 9. VAULT HYDRATION
  // Re-loads the user's specific memory vault when their wallet connects.
  useEffect(() => {
    if (publicKey && isMounted) {
      const vaultKey = `kinetic_vault_${publicKey.toBase58()}`;
      const savedData = localStorage.getItem(vaultKey);

      if (savedData) {
        const memory = JSON.parse(savedData);
        setVaultMemories(memory);
        console.log(`KINETIC // Vault Hydrated: ${memory.length} facts recovered.`);
      } else {
        setVaultMemories([]);
      }
      playHydrationSound();
    } else {
      setVaultMemories([]);
    }
  }, [publicKey, isMounted]);

  const saveToVault = (newMessage: string) => {
    if (!publicKey) return;
    const vaultKey = `kinetic_vault_${publicKey.toBase58()}`;
    const currentVault = JSON.parse(localStorage.getItem(vaultKey) || "[]");

    const updatedVault = [...currentVault, {
      fact: newMessage,
      timestamp: new Date().toISOString()
    }];

    localStorage.setItem(vaultKey, JSON.stringify(updatedVault));
    return updatedVault;
  };
  // --- END STRICT LOGIC PRESERVATION ---

  return (
    <div
      className="flex min-h-screen flex-col bg-[var(--background)] text-[var(--foreground)] font-sans selection:bg-indigo-100 dark:selection:bg-indigo-900"
      onPointerMove={(e) => {
        const bg = document.getElementById('houdini-bg');
        if (bg) {
          // Direct DOM updates are drastically faster for Houdini variables than stacking animation frames
          const x = (e.clientX / window.innerWidth) * 100;
          const y = (e.clientY / window.innerHeight) * 100;
          bg.style.setProperty('--ring-x', x.toString());
          bg.style.setProperty('--ring-y', y.toString());
        }
      }}
      onPointerLeave={() => {
        const bg = document.getElementById('houdini-bg');
        if (bg) {
          bg.style.setProperty('--ring-x', '50');
          bg.style.setProperty('--ring-y', '50');
        }
      }}
    >
      {/* HOUDINI PAINTWORKLET LAYER */}
      <div
        id="houdini-bg"
        className="pointer-events-none fixed inset-0 opacity-80"
        style={{
          '--ring-radius': 100,
          '--ring-thickness': 600,
          '--particle-count': 80,
          '--particle-rows': 25,
          '--particle-size': 2,
          '--particle-color': '#6366f1',
          '--particle-min-alpha': 0.1,
          '--particle-max-alpha': 0.8,
          '--ring-x': 50,
          '--ring-y': 50,
          backgroundImage: 'paint(ring-particles)',
          zIndex: 0,
          // REMOVED: transition property. 
          // JS drives the animation flawlessly at your native refresh rate without CSS fighting it.
        } as any}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-white/40 pointer-events-none" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col px-4 py-4 sm:px-6 sm:py-6 lg:px-10 lg:py-8">
        {/* HEADER */}
        <header className="relative z-50 mb-8 grid grid-cols-3 items-center rounded-full px-6 py-3 glass-panel overflow-visible">
          <div className="flex items-center gap-6">
            <img src="/logo.png" alt="Kinetic Logo" className="h-8 w-auto object-contain" />
          </div>

          {/* CENTER: WALLET & IDENTITY */}
          <div className="flex flex-col items-center justify-center gap-2 relative z-[100]">
            {isMounted && (
              <>
                <div className="flex items-center gap-3 relative z-[9999] overflow-visible">
                  <div className="relative">
                    <style dangerouslySetInnerHTML={{
                      __html: `
                      .safe-wallet-btn {
                        background-color: var(--foreground) !important;
                        color: var(--background) !important;
                        height: 40px !important;
                        padding: 0 24px !important;
                        border-radius: 999px !important;
                        font-size: 0.75rem !important;
                        font-weight: 700 !important;
                        font-family: inherit !important;
                        transition: all 0.2s ease !important;
                        display: flex !important;
                        align-items: center !important;
                        gap: 10px !important;
                      }
                      .safe-wallet-btn:hover {
                        opacity: 0.8 !important;
                        transform: translateY(-1px);
                        box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
                      }
                    `}} />
                    <WalletMultiButton className="safe-wallet-btn">
                      {userName}
                    </WalletMultiButton>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* RIGHT: THEME TOGGLE */}
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-[var(--glass-bg)] transition-all duration-300 text-[var(--foreground)] active:scale-95"
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
        </header>

        {/* MAIN CONTAINER: STACKED LAYOUT */}
        <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 items-center">

          {/* CHATBOT (TOP, FULL WIDTH) */}
          <section className="flex h-[80vh] sm:h-[85vh] w-full flex-col overflow-hidden rounded-[2rem] glass-panel shadow-2xl shadow-indigo-500/10 transition-all duration-500 hover:shadow-indigo-300/30">
            <div className="border-b border-[var(--border-color)] bg-[var(--card-bg)] px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)]">
                  <span className="inline-flex h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                  <span className="uppercase tracking-[0.18em]">KINETIC - By Erastus</span>
                </div>
                <button
                  onClick={handleIpfsSync}
                  disabled={isSyncing || isIpfsSynced}
                  suppressHydrationWarning={true}
                  className={`text-[0.65rem] font-bold flex items-center gap-1.5 transition-all duration-300 rounded-full border px-3 py-1.5 ${isIpfsSynced
                    ? "text-emerald-700 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400"
                    : "text-[var(--text-muted)] border-[var(--border-color)] hover:bg-[var(--glass-bg)]"
                    } ${isSyncing ? "animate-pulse" : ""}`}
                >
                  <Cloud size={14} className={`${isIpfsSynced ? "text-emerald-500" : "text-slate-400"}`} />
                  {isSyncing ? "SYNCING..." : isIpfsSynced ? "VAULT HYDRATED" : "SYNC TO IPFS"}
                </button>
              </div>
            </div>

            {/* MESSAGE CONTAINER */}
            <div className="flex-1 space-y-6 overflow-y-auto px-4 py-6 sm:px-8 custom-scrollbar">
              {messages.length === 0 && (
                <div className="flex justify-center py-10 text-center">
                  <div className="max-w-md rounded-3xl border border-[var(--border-color)] bg-[var(--card-bg)] px-6 py-6 shadow-sm backdrop-blur-sm">
                    <Cloud className="mx-auto mb-3 text-indigo-200" size={40} />
                    <p className="leading-relaxed text-sm text-slate-600">
                      {isIpfsSynced
                        ? userName
                          ? `Neural Link Established. Greetings, ${userName}. Your sovereign state is hydrated and ready.`
                          : "Neural Link Established. State is anonymous. Please initialize identity."
                        : "Agent initialized. No state detected. Please connect wallet to inject memory vector."
                      }
                    </p>
                    <p className="mt-4 text-[0.65rem] font-bold uppercase tracking-[0.22em] text-[var(--text-muted)]">
                      KINETIC // PROTOCOL HANDSHAKE
                    </p>
                  </div>
                </div>
              )}

              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex max-w-[85%] items-end gap-3 ${m.role === 'user' ? 'flex-row' : 'flex-row-reverse'}`}>
                    <div className={`rounded-3xl px-6 py-4 text-sm shadow-sm border backdrop-blur-md ${m.role === 'user'
                      ? 'bg-indigo-600/90 border-indigo-400/50 text-white rounded-br-sm'
                      : 'bg-[var(--card-bg)] border-[var(--border-color)] text-[var(--foreground)] rounded-bl-sm'
                      }`}>
                      <div className="leading-relaxed whitespace-pre-wrap">
                        {m.parts?.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('').split(/(\*\*.*?\*\*)/g).map((part: string, i: number) =>
                          part.startsWith('**') && part.endsWith('**')
                            ? <strong key={i} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>
                            : part
                        )}
                      </div>
                      <p className={`mt-3 text-[0.6rem] font-bold uppercase tracking-[0.22em] ${m.role === 'user' ? 'text-indigo-400' : 'text-[var(--text-muted)]'}`}>
                        {m.role === 'user' ? 'USER // SOVEREIGN STATE' : 'KINETIC // DECRYPTED'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1.5 rounded-3xl rounded-bl-sm border border-[var(--border-color)] bg-[var(--card-bg)] px-5 py-4 shadow-sm">
                    <div className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce" />
                    <div className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce delay-75" />
                    <div className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce delay-150" />
                  </div>
                </div>
              )}
            </div>

            {/* INPUT AREA */}
            <div className="border-t border-[var(--border-color)] bg-[var(--glass-bg)] p-4 sm:p-6 backdrop-blur-xl">
              <form onSubmit={onSovereignSubmit} className="relative rounded-full border border-[var(--border-color)] bg-[var(--background)] shadow-inner">
                <div className="relative flex items-center gap-2 pr-2">
                  <input
                    type="text"
                    placeholder="Query your sovereign AI..."
                    value={input || ""}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    suppressHydrationWarning={true}
                    className="h-14 flex-1 rounded-full bg-transparent px-6 text-sm text-[var(--foreground)] placeholder:text-[var(--text-muted)] outline-none focus:bg-[var(--card-bg)] focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !(input || "").trim()}
                    suppressHydrationWarning={true}
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--foreground)] text-[var(--background)] shadow-md transition hover:bg-indigo-600 disabled:opacity-30 disabled:hover:bg-[var(--foreground)]"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </div>
          </section >

          {/* VECTOR STATE ENGINE (BOTTOM, FULL WIDTH) */}
          < aside className="w-full flex flex-col rounded-[2.5rem] glass-panel shadow-lg shadow-indigo-500/5 mb-10" >
            <div className="flex items-center justify-between border-b border-[var(--border-color)] px-6 py-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--foreground)]">Vector State Engine</p>
                <p className="mt-1 text-[0.7rem] text-[var(--text-muted)]">Debug · Hackathon Overlay</p>
              </div>
              <div className="flex items-center gap-1">
                <span className="inline-flex h-2 w-6 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 text-xs font-mono text-[var(--text-muted)]">
              <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-5 shadow-inner backdrop-blur-sm">
                <p className="mb-3 text-[0.7rem] font-bold text-[var(--foreground)]">$ state-engine --inspect</p>
                <div className="space-y-2.5 text-[0.7rem] leading-relaxed">
                  <p className="flex items-center gap-2 text-[var(--text-muted)]">&gt; Active Wallet: <span className="text-[var(--foreground)]">{activeWalletDisplay}</span></p>
                  <p className="text-[var(--text-muted)]">&gt; AES-256 Key: <span className="text-emerald-600 font-semibold">Derived</span></p>
                  <p className="text-[var(--text-muted)]">&gt; IPFS CID: <span className="text-indigo-600 font-semibold">{isSyncing ? "GENERATING..." : "QmXoyp...7b"}</span></p>
                  <p className="text-[var(--text-muted)]">&gt; Solana Hook: <span className="text-indigo-500 font-semibold">Active</span></p>
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-5 shadow-inner backdrop-blur-sm">
                <p className="mb-3 text-[0.7rem] font-bold text-[var(--foreground)]">telemetry::stream</p>
                <div className="space-y-2.5 text-[0.7rem] text-[var(--text-muted)]">
                  <p>[devnet] listening for state diffs...</p>
                  <p>[vector] &gt; ipfs.hydrate() · <span className="text-indigo-600 font-semibold">OK</span></p>
                  <p>[status] &gt; <span className={publicKey ? "text-emerald-600 font-bold" : "text-rose-500 font-bold"}>{publicKey ? "HYDRATED" : "STATELESS"}</span></p>
                </div>
              </div>
            </div>
          </aside >

        </main >
      </div >
    </div >
  );
}