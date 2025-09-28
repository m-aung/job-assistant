# Job Assistant Monorepo

This repository is a minimal monorepo with two packages:

- `@job-assistant/backend` — Express API (port 3001)
- `@job-assistant/frontend` — Vite-powered static frontend (dev server via Vite)

Prerequisites

- Node.js 16+ and npm 7+ (for npm workspaces)

Quick start

```bash
cd /Users/mymac/job-assistant
npm install
npm run start
```

- Frontend served by Vite (open the URL shown in the terminal, typically http://localhost:5173)
- Backend API available at http://localhost:3001/api/hello

To run packages individually:

- Backend: `npm run start:backend`
- Frontend: `npm run start:frontend`
