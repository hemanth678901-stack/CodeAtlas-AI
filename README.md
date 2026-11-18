# CodeAtlas AI — Codebase Understanding & Architecture Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8.svg)](https://tailwindcss.com/)
[![Gemini 3.8 Flash](https://img.shields.io/badge/Google_Gemini-3.8_Flash-4285F4.svg)](https://aistudio.google.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-purple.svg)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **CodeAtlas AI** is an AI-powered codebase exploration and architectural understanding platform. It allows engineers, students, and teams to inspect unfamiliar public GitHub repositories through interactive 4-tier mind maps, dynamic Mermaid.js execution flows, dependency cycle matrices, and grounded AI question answering.

---

## 🏛️ System Architecture

```text
+-------------------------------------------------------------------------------+
|                             CodeAtlas AI Platform                             |
+-------------------------------------------------------------------------------+
                                        |
       +--------------------------------+--------------------------------+
       |                                                                 |
       v                                                                 v
+-------------------------------+                       +-------------------------------+
|     Frontend (React 19 + TS)  |                       |     Backend Server (Express)  |
|  - @xyflow/react (Mind Map)   |  REST API (/api/...)  |  - GitHub REST & Tree Engine  |
|  - Mermaid.js (Execution Flow)| <===================> |  - Multi-Language AST Parser  |
|  - File Explorer & Drawer     |                       |  - Cycle Detection Matrix     |
|  - PWA Service Worker Cache   |                       |  - Grounded RAG Retrieval     |
|  - In-App Install Prompt      |                       |  - Google Gemini 3.8 Flash    |
+-------------------------------+                       +-------------------------------+
```

---

## ✨ Core Features

1. **GitHub Repository Ingestion Engine**:
   - Parses repository URLs (HTTPS, SSH, shorthand `owner/repo`, branch subpaths).
   - Retrieves recursive repository trees and filters out node_modules, binaries, and lockfiles.
   - Heuristically prioritizes core source files, configuration manifests, and entry points.

2. **Interactive Architecture Mind Map**:
   - Built with `@xyflow/react` (React Flow) rendering a 4-tier hierarchical graph:
     - **Level 0**: Repository Root
     - **Level 1**: Functional Modules & Folders
     - **Level 2**: Core Source Files & Entry Points
     - **Level 3**: Important Functions, Methods, and Classes
   - Directed edges representing `contains`, `imports`, `calls`, and `inferred` relations.
   - Canvas features pan, zoom, fit-to-view, minimap, and click-to-inspect drawers.

3. **Execution Flow Visualizer**:
   - Dynamic **Mermaid.js** sequence diagrams generated from static code traces.
   - Multi-flow switcher (e.g., *Application Lifecycle / Boot*, *HTTP Request & Middleware Pipeline*).
   - Step-by-step breakdown with actors, actions, targets, and direct file citation links.

4. **File-by-File Explanation & Code Inspector**:
   - Purpose summaries, concrete responsibilities, input/output contracts, and method signatures.
   - Syntax-highlighted code viewer with line numbers and one-click clipboard copying.

5. **Dependency Matrix & Cycle Detection**:
   - Outgoing import dependencies (internal files vs. external libraries).
   - Incoming callers ("Imported by").
   - Automated circular dependency cycle detection with alert badges.

6. **Grounded AI Codebase Assistant**:
   - Retrieval-Augmented Generation (RAG) powered by server-side **Gemini 3.8 Flash**.
   - Answers questions strictly grounded in analyzed source code with clickable file citation pills.

7. **Progressive Web App (PWA) Support**:
   - Downloadable directly to Desktop (Windows, macOS, Linux) or Mobile (Android Home Screen).
   - Offline fallback status indicator and service worker caching.

---

## 🔒 Security & Secrets Zero-Leak Policy

- **No Hardcoded Keys**: The application uses `process.env.GEMINI_API_KEY` exclusively on the server side.
- **Client Bundle Protection**: Keys are never sent to the browser or bundled in client-side code.
- **Untrusted Input Handling**: Repository code is treated strictly as plain text data and is never executed on the host.
- **Git Protection**: `.gitignore` strictly excludes all `.env` files, production build artifacts, and system caches.

---

## 🛠️ Getting Started Locally

### Prerequisites
- Node.js >= 20.x
- npm >= 9.x

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/codeatlas-ai.git
cd codeatlas-ai

# 2. Install dependencies
npm install
```

### Environment Variables
Create a local `.env` file in the root directory (or export in your shell) with the following variables:
```env
# Required for live Gemini AI synthesis and codebase Q&A
GEMINI_API_KEY="your-gemini-api-key"

# Optional: Default model is 'gemini-3.8-flash'
GEMINI_MODEL="gemini-3.8-flash"

# Optional: Personal Access Token (with public_repo scope) to increase GitHub rate limit from 60 to 5,000 req/hr
GITHUB_TOKEN="your-github-token"

# Optional: Server port (defaults to 3000)
PORT=3000
```

### Launch Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts full-stack Express server with Vite middlewares on port 3000 |
| `npm run build` | Compiles production frontend bundle and PWA service worker assets |
| `npm run clean` | Removes generated build artifacts (`dist`, `.vite`, `coverage`, `bun.lock`) |
| `npm test` | Runs the full Vitest automated test suite |
| `npm run test:watch` | Runs Vitest in interactive watch mode |
| `npm run lint` | Runs TypeScript static typecheck (`tsc --noEmit`) |
| `npm start` | Launches production server |

---

## 🔄 CI/CD & Contribution Guidelines

This repository enforces strict automated quality gates through **GitHub Actions**:

### Continuous Integration (CI)
On every Pull Request submitted by contributors:
1. **Type & Lint Check**: Runs `npm run lint` (`tsc --noEmit`).
2. **Unit & Integration Tests**: Runs `npm test` across URL parsing, AST analyzer, PWA assets, and samples.
3. **Production Build**: Runs `npm run build` to verify bundle compilation and PWA compliance.

> **Pull Request Merge Gate**: If any test or check fails, GitHub automatically blocks merging. Pull requests must pass all CI checks before the repository maintainer conducts manual review and merges into `main`.

---

## 📄 License
MIT © CodeAtlas AI Contributors.
