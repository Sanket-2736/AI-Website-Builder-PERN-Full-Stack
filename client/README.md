# AI Builder — Frontend (MERN) 🚀

**AI Builder** is the frontend for a MERN-stack AI project built with **React**, **TypeScript**, and **Vite**. This repository contains a Vite + React TypeScript app designed to provide an interactive UI for building and previewing AI-assisted projects.

---

## 🔍 Project overview

- **Framework:** React + TypeScript
- **Bundler / Dev server:** Vite
- **Styling:** Tailwind CSS (installed)
- **Linting:** ESLint
- **Key features:** Editor panel, project previews, project pages, and reusable components (see `src/components` and `src/pages`).

---

## ⚙️ Prerequisites

- Node.js 18+ (or compatible)
- npm (or pnpm/yarn) installed

> Windows tip: run commands from PowerShell or an appropriate terminal.

---

## 🚀 Quick start

Open a terminal and run:

```bash
cd frontend
npm install
npm run dev
```

Then open http://localhost:5173 in your browser (Vite default port).

### Available scripts (from `frontend/package.json`)

- `npm run dev` — start Vite dev server
- `npm run build` — typecheck and build for production (`tsc -b && vite build`)
- `npm run preview` — locally preview the production build
- `npm run lint` — run ESLint across the project

---

## 🗂 Project structure (important paths)

- `frontend/src/` — application source
  - `components/` — shared UI components (EditorPanel, Sidebar, ProjectPreview, etc.)
  - `pages/` — route pages (Home, Projects, Preview, Community, etc.)
  - `assets/` — static assets and `schema.prisma` & `System Prompt.txt`
  - `types/` — TypeScript types
- `frontend/index.html`, `vite.config.ts`, `tsconfig.*` — build & dev config

---

