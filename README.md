# ⚡ Pokémon GO Dex Tracker

[![Deploy to GitHub Pages](https://github.com/Lukas0923xcv/dex/actions/workflows/deploy.yml/badge.svg)](https://github.com/Lukas0923xcv/dex/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg?logo=docker&logoColor=white)](docker-compose.yml)
[![SQLite WAL](https://img.shields.io/badge/SQLite-WAL%20Mode-003B57.svg?logo=sqlite&logoColor=white)](server/src/db/index.js)

A lightweight, modern, responsive Pokémon GO Collection & Living Dex Tracker. Engineered with a **dual-architecture** that supports:
1. **GitHub Pages Live App:** 100% static, client-side, zero-config web app hosted directly on [https://lukas0923xcv.github.io/dex/](https://lukas0923xcv.github.io/dex/).
2. **Self-Hosted Linux Server:** Single-command containerized deployment on Ubuntu Server 26 (or any Linux distribution) using Docker Compose and high-performance SQLite in Write-Ahead Logging (WAL) mode with persistent volumes.

---

## 🚀 Instant Deployment

### Option A: One-Command Installer (Ubuntu Server 26 / Linux)
On your Ubuntu server, run this single command:
```bash
curl -sSL https://raw.githubusercontent.com/Lukas0923xcv/dex/main/install.sh | bash
```
> **What this does:**
> - Automatically checks and installs Docker & Docker Compose if missing.
> - Clones the repository to `/opt/pogo-dex`.
> - Sets up the persistent SQLite volume (`/opt/pogo-dex/data`).
> - Builds and starts the production container on port `3000`.
> - Displays your server IP and access URL (e.g. `http://<your-server-ip>:3000`).

---

### Option B: Docker Compose (Manual Deployment)
If you prefer running with `git` and `docker compose`:
```bash
# 1. Clone repository
git clone https://github.com/Lukas0923xcv/dex.git
cd dex

# 2. Start container in background
docker compose up -d
```
Open **`http://localhost:3000`** (or your server's IP).

---

### Option C: Use via GitHub Pages (No Server Required!)
Visit:
👉 **[https://lukas0923xcv.github.io/dex/](https://lukas0923xcv.github.io/dex/)**

- Stores your caught Pokémon and checklists in browser storage.
- Works offline as a PWA-ready checklist on your phone while playing Pokémon GO.
- 1-click JSON backup export/import to transfer your progress between devices anytime!
- Optional: Connect your GitHub Pages interface to your private self-hosted server in **Settings → Remote Backend URL**.

---

## 🌟 Key Features

### 1. Dedicated Tracking Categories
- **Standard Dex:** All 1,024+ base species released across Generations 1 to 9 (Kanto to Paldea).
- **Shiny Dex:** Dedicated shiny checklist toggle with shiny sprites.
- **Mega Dex:** All Mega Evolutions and Primal forms (Mega Charizard X/Y, Mega Rayquaza, Primal Kyogre/Groudon, etc.).
- **All Forms Dex:** Regional variants (Alolan, Galarian, Hisuian, Paldean) and special forms (Castform, Deoxys, Vivillon patterns, Unown, Furfrou trims, Necrozma, etc.).
- **Custom Collections:** Create arbitrary custom checklists (e.g. *"Lucky Trade Wishlist"*, *"PvP Great League Targets"*, *"Shadow 100%"*). Add or remove any Pokémon to custom lists with one click.

### 2. Streamlined UI & Interactions
- **One-Click Caught Toggle:** Tap or click any card to instantly mark it as caught. Uncaught cards display in 45% grayscale; caught cards illuminate with vibrant full color, glowing borders, and checkmark badges.
- **Real-Time Search & Quick Filters:** Filter by generation (Gen 1–9), Pokémon type (all 18 types), or caught status (All / Caught / Uncaught), plus instant keyword search by name or dex number.
- **Progress Tracking:** Live progress counter (e.g. `142 / 151 (94%)`) with animated completion bars and celebratory confetti upon completing any generation or category!
- **Data Portability:** Full JSON backup export and restore in the Settings menu.

### 3. Reliable Sprite & Asset Strategy
- High-resolution Pokémon GO 3D icon sprites sourced directly from PokéMiners Game Master assets.
- **Cascading Fallback Chain:** Automatically falls back gracefully to Pokémon HOME 3D sprites and official artwork CDN if a specialized asset is missing.

---

## 🛠️ Architecture & Tech Stack

```
dex/
├── .github/workflows/deploy.yml   # Automated GitHub Pages CI/CD workflow
├── client/                        # React 18 + Vite + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/            # Header, ProgressBar, FilterBar, PokemonGrid, Modals
│   │   ├── data/                  # Bundled Pokémon GO metadata (1,492 entries)
│   │   ├── hooks/useDex.ts        # Reactive dex state manager
│   │   ├── services/storage.ts    # Isomorphic storage (SQLite API ↔ LocalStorage fallback)
│   │   └── utils/typeColors.ts    # Official Pokémon type palette & helpers
├── server/                        # Node.js + SQLite Backend
│   ├── src/
│   │   ├── db/                    # Native node:sqlite with WAL mode enabled
│   │   ├── routes/api.js          # REST API (/api/pokemon, /api/progress, /api/collections)
│   │   └── server.js              # Express server serving API + static frontend
├── scripts/
│   └── compile-pogo-data.js       # Pokémon GO Game Master data compiler
├── Dockerfile                     # Multi-stage production container build
├── docker-compose.yml             # Single-command Docker Compose stack
├── install.sh                     # Ubuntu Server 26 / Linux 1-command installer
└── README.md
```

### Environment Variables
| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | HTTP port for server and container |
| `DATA_DIR` | `./data` | Directory for persistent SQLite database (`dex.db`) |
| `NODE_ENV` | `production` | Runtimes mode (`production` / `development`) |

---

## 💻 Local Development

### Prerequisites
- Node.js 22+ (includes built-in `node:sqlite`)
- npm 10+

### Setup
```bash
# 1. Install dependencies
npm run install:all

# 2. Compile Pokémon GO data & seed database
npm run compile:data
npm run seed

# 3. Run development servers
# Terminal 1: Backend API
npm run dev:server

# Terminal 2: Frontend Client (Vite)
npm run dev:client
```
The Vite development server runs on `http://localhost:5173` and automatically proxies `/api` calls to the backend on `http://localhost:3000`.

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
Pokémon and Pokémon GO are trademarks of Nintendo, Game Freak, Creatures Inc., and Niantic Inc. This project is for personal tracking and educational purposes.
