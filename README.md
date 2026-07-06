# Quantix SaaS Platform Admin Portal

This is the Admin Portal for the **Quantix SaaS Platform**, built with React, Vite, TypeScript, and Tailwind CSS.

---

## 🚀 Getting Started

Follow these steps to set up and run the project locally on your machine.

### 1. Prerequisites
Make sure you have the following installed:
- **Node.js** (v18 or higher recommended)
- **Yarn** (v2+ / Berry is used in this repository)

### 2. Installation
Navigate to the project root directory and install dependencies:
```bash
# Navigate to the inner project directory
cd Quantix.PlatformAdmin

# Install dependencies using Yarn
yarn install
```

### 3. Run Development Server
To start the local development server, run the following command:
```bash
yarn run dev
# OR
yarn dev
```
- The application will start at **`http://localhost:3001`**.
- Vite is configured to automatically proxy API requests (`/api/*`) to the local backend API server running at **`http://localhost:5104`**.

### 4. Build for Production
To generate a production-ready build:
```bash
yarn run build
```
The compiled, optimized output will be placed in the `dist/` directory.

---

## ⚙️ Environment Variables Config

The project uses a structured multi-file `.env` system to automate configurations across environments without manual code edits:

- **[`.env`](.env)**: Local defaults. This file is git-ignored. You can edit this file to apply custom settings for your personal workspace.
- **[`.env.development`](.env.development)**: Development environment values. Targets the local API server (`http://localhost:5104`).
- **[`.env.production`](.env.production)**: Production environment values. Targets the live API server (`https://platform-api.quantix.com`).

Vite automatically loads the correct environment variables based on the script you run.

---

## 📂 Project Structure

```text
src/
├── core/             # Global configurations, services (axios, logging), and state (Redux store)
├── lib/
│   └── api/          # Central API client services (Auth, Merchants, Billing) & Mock Service Worker (MSW)
├── modules/          # Page and feature modules (Auth, Rate Cards, Dashboard, etc.)
├── shared/
│   ├── components/   # Shared complex components (ATMTable, SearchInput)
│   └── ui/           # Generic atomic UI components (ATMButton, ATMAvatar, ATMBadge)
└── styles/           # Global styles and Tailwind configuration
```

---

## 🤖 AI Coding Agents & Copilots Guide

This project includes a comprehensive [`.agents/AGENTS.md`](.agents/AGENTS.md) file which is the authoritative single source of truth for all AI coding assistants (like Gemini, Antigravity, Claude Code, Cursor, Windsurf, Copilot) and human engineers working on the codebase.

### Important for AI Agents:
- **Read First**: Always read the [`.agents/AGENTS.md`](.agents/AGENTS.md) guidelines before proposing or modifying any code.
- **Rules & Constraints**: Adhere strictly to the approved stack, banned libraries, and component naming/import guidelines defined within the agent instructions.

---

## 🛠️ CLI Commands Checklist

| Command | Action |
| :--- | :--- |
| `yarn dev` / `yarn run dev` | Start local Vite development server |
| `yarn build` | Compile TypeScript and bundle application for production |
| `yarn typecheck` | Run the TypeScript compiler in diagnostics-only mode |
| `yarn lint` | Check codebase for ESLint warnings and errors |
| `yarn format` | Automatically format code files using Prettier |
| `yarn test` | Execute unit test suite once using Vitest |
| `yarn test:watch` | Run unit tests in interactive watch mode |
