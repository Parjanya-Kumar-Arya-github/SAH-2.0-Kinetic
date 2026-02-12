# Kinetic: The Sovereign AI Memory Protocol

> **"Don't rent your intelligence. Own it."**

Kinetic is a hybrid Web3/AI protocol that decouples **Intelligence (Model)** from **Memory (State)**. It anchors AI personality, learning history, and context to a **Solana NFT**, allowing users to own their AI's "Soul" and transfer it between applications, just like plugging a USB drive into a different computer.

![Architecture](https://via.placeholder.com/800x400?text=Kinetic+Protocol+Architecture+Hybrid+Model)

## System Architecture

Kinetic uses a **Separation of Concerns** architecture to balance speed (Web2) and sovereignty (Web3).

### 1. The Soul (On-Chain Registry)
* **Technology:** Solana (Anchor) + Token-2022 Extensions.
* **Role:** Acts as the immutable "Registry of Truth."
* **Mechanism:**
    * **MetadataPointer:** Points to the latest IPFS CID containing the encrypted memory root.
    * **TransferHook:** Programmatically enforces "Memory Wipes" on the client side when the NFT is transferred.

### 2. The Brain (Off-Chain Inference)
* **Technology:** LangChain + OpenAI GPT-4o.
* **Role:** Stateless reasoning engine. It has no memory of its own; it must "hydrate" context from the user's NFT.

### 3. The Memory (Encrypted State)
* **Technology:** Pinecone (Vector DB) + IPFS (Pinata).
* **Innovation:** **Namespace Isolation**.
    * Every Vector DB query is scoped strictly to `namespace = NFT_Mint_Address`.
    * Data is encrypted client-side using **AES-256**, with keys derived from the user's **Ed25519** wallet signature.

---

## Key Features

* **Sovereign Injection:** The AI agent is empty at runtime. It only becomes "smart" when a user signs a transaction to unlock their NFT's memory vector space.
* **Trustless Privacy:** We use `TweetNaCL.js` for client-side encryption. The backend API never sees raw text, only encrypted vector blobs.
* **The "Lobotomy" Transaction:** Atomic ownership transfer. If you sell your "Tutor AI" NFT, you instantly lose access to its memory. The new owner gains full context immediately.
* **Universal Compatibility:** Standardization of the "Memory Save File" means a Kinetic NFT can power a Tutor App, a Resume Builder, or a Game Character without retraining.

---

## Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Blockchain** | **Solana** | Mainnet/Devnet for high-throughput state updates (400ms). |
| **Contract** | **Anchor (Rust)** | Custom program implementing `MetadataPointer` & `TransferHook`. |
| **Agent** | **LangChain** | Orchestrates ReAct loops and RAG pipelines. |
| **Vector DB** | **Pinecone** | Stores 1536-d embeddings with HNSW indexing. |
| **Storage** | **IPFS** | Merkle DAG storage for encrypted state snapshots. |
| **Frontend** | **Next.js 14** | React Server Components with Solana Wallet Adapter. |

---

## Getting Started

### Prerequisites
* Node.js v18+
* Rust & Cargo (for Anchor)
* Solana CLI Tools
* Phantom Wallet

### 1. Clone the Repository
```bash
git clone [https://github.com/parjanya-arya/kinetic-protocol.git](https://github.com/parjanya-arya/kinetic-protocol.git)
cd kinetic-protocol
