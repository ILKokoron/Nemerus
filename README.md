# NEMERUS

> Your research. Your data. On Walrus.

Named after **Mneme** — the Greek Muse of memory.

Nemerus is a decentralized research workspace built on Walrus Protocol. Track projects, manage tasks with deadlines, and auto-summarize research with AI. Your data is stored as an immutable blob on Walrus — no server, no account, no vendor lock-in.

## Features

- **Project tracking** — add research projects with status (researching / active / done / archived)
- **AI summarization** — auto-summarize any project description via Groq (bring your own key)
- **Task management** — add tasks with deadlines, color-coded urgency (red/yellow/green)
- **Walrus storage** — all data saved as JSON blob on Walrus, loaded by blob ID
- **Sui wallet** — data tied to your wallet address via dApp Kit
- **Fully client-side** — no backend, no server, your keys stay local

## Tech Stack

- React + Vite
- Sui dApp Kit (wallet connect)
- Walrus HTTP API (testnet publisher/aggregator)
- Groq API — llama3-8b-8192 (BYOK)

## Setup

```bash
npm install
npm run dev
```

## Deploy to Walrus Sites

```bash
npm run build
# then use walrus-sites CLI to deploy dist/ folder
site-builder publish dist/ --epochs 5
```

## How it works

1. Connect Sui wallet
2. App checks localStorage for existing blob ID tied to your wallet
3. If found, fetches your data from Walrus aggregator
4. All changes are serialized to JSON and uploaded to Walrus publisher
5. New blob ID saved to localStorage

Each save creates a new immutable blob — Walrus is append-only by design.

## Submission

Built for The Walrus Sessions hackathon (April 17–27, 2026).
