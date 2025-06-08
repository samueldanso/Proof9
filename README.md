![Proof9 Banner](https://raw.githubusercontent.com/samueldanso/Proof9/main/public/banner.png)

# Proof9 — Protect, license, and monetize your sound, on Story

Proof9 is a sound rights platform where creators protect, verify, license, and monetize their sound IP through on-chain ownership, AI-powered originality verification, and real connection with fans — powered by Story Protocol, Yakoa, and Tomo.

## Problem

Creators of music, voice, and sound struggle to prove ownership, protect their work, and monetize it effectively. Licensing is complicated, piracy is rampant, and current systems lack transparency, especially for independent artists.

## Solution

Proof9 is a sound rights platform that gives creators the tools to protect their IP, verify originality, license usage, and monetize their sound — all backed by on-chain provenance and AI verification. Powered by Story Protocol, Yakoa, and Tomo, creators can confidently manage and earn from their sound IP in a transparent, decentralized ecosystem.

## Features

-   **🔐 On-chain ownership** — Upload and register your sound IP with blockchain-backed provenance using Story Protocol.

-   **🧠 AI-powered verification** — Detect originality and duplicates with Yakoa's intelligent fingerprinting.

-   **📜 Smart licensing** — Set clear usage terms and license your sound for B2B or creator use with traceable permissions.

**💸 Automated royalties** — Earn automatically when your sound is licensed and used, tracked and enforced by smart contracts.

** 🤝 Real fan connection** — Share exclusive drops, updates, and build community relationships via Tomo-powered messaging and profiles.

## How it Works

### ⚙️ How It Works

### For Creators

1. **Sign up & create your profile**
2. **Upload your sound & verify originality with AI**
3. **Register IP & set license terms on-chain**
4. **Share, track usage, and earn royalties**

### For Fans / Licensees

1. **Sign up & explore verified sound**
2. **View license terms & purchase usage rights**
3. **Use the sound confidently & track ownership**
4. **Support creators and access exclusive drops**

## Tech Stack

### Frontend

-   **Framework**: [Next.js 15](https://nextjs.org/)
-   **Language**: [TypeScript 5](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
-   **UI Library**: [Shadcn UI](https://ui.shadcn.com/)
-   **Theme**: [next-themes](https://github.com/pacocoursey/next-themes)
-   **Web3 Wallet & Social Login**: [Tomo SDK](https://docs.tomo.inc/tomo-sdk/tomoevmkit)
-   **Web3 Integration**: [wagmi](https://wagmi.sh/), [viem](https://viem.sh/)
-   **Forms & Validation**: [react-hook-form](https://react-hook-form.com/), [zod](https://zod.dev/)
-   **Data Fetching**: [TanStack Query](https://tanstack.com/query)

### Backend

-   **Runtime**: [Bun](https://bun.sh/)
-   **Framework**: [Hono](https://hono.dev/), [TypeScript 5](https://www.typescriptlang.org/)
-   **Story Protocol**: [@story-protocol/core-sdk](https://docs.storyprotocol.xyz/)
-   **Web3 Integration**: [viem](https://viem.sh/)
-   **Validation**: [zod](https://zod.dev/), [@hono/zod-validator](https://hono.dev/middleware/validator)
-   **Offchain Database**: [Supabase](https://supabase.com/) (PostgreSQL)
-   **Storage**: [IPFS (via Pinata)](https://www.pinata.cloud/)
-   **Verification**: [Yakoa API](https://docs.yakoa.ai/)

## Story Protocol Integration

Proof9 utilizes Story Protocol for on-chain IP registration and licensing:

-   **IP Asset Registration**: `/api/registration/register` and `/api/registration/register-custom` - Register music as IP assets with commercial remix terms and royalty sharing
-   **License Token Minting**: `/api/licenses/mint` - Create transferable license tokens for commercial use
-   **Limited License Creation**: `/api/licenses/one-time-use` - Generate IP assets with constrained licensing (token limits via hooks)
-   **Royalty Management**: `/api/royalty/pay`, `/api/royalty/claim`, and `/api/royalty/transfer` - Revenue distribution and collection between IP owners
-   **IPFS Metadata Storage**: All IP and NFT metadata uploaded to IPFS with proper hashing for blockchain verification

## Yakoa Integration

Proof9 integrates Yakoa for basic music content verification:

-   **Content Registration**: `/api/verification/verify-music` - Register music tokens with Yakoa's verification service
-   **Status Monitoring**: `/api/verification/status/:tokenId` - Check verification status and infringement detection results
-   **Brand Authorization**: `/api/verification/authorize` - Manage brand permissions for licensed content
-   **Pre-Registration Verification**: Verify content authenticity before Story Protocol IP registration

## Setup

### Prerequisites

-   Node.js 18+
-   **Package Manager**: [Bun](https://bun.sh/)
-   **Backend Framework**: [Hono](https://hono.dev/)
-   **Linting & Formatting**: [Biome](https://biomejs.dev/)

1. Clone the repository:

    ```bash
    git clone https://github.com/samueldanso/Proof9.git
    cd Proof9
    ```

2. Install dependencies:

    ```bash
    bun install
    ```

3. Set up environment variables:

    ```bash
    cp env.example .env
    ```

    Then edit `.env` and add your API keys and credentials:

4. Start the development server:

    ```bash
    bun run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) in your browser

## Roadmap

-   [ ]

## Contributing

1. Create a new branch
2. Make your changes
3. Submit a pull request
