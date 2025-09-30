Deployment note — frontend -> backend proxy

This frontend uses relative `/api/*` paths in code. For local development, Vite's dev server proxy is configured in `vite.config.ts`.

When deploying the frontend separately to Vercel (or another host), set the following environment variable so the frontend will call the correct backend base URL in production:

- VITE_API_BASE — e.g. `https://your-backend.vercel.app`

How it works

- Locally: `VITE_API_BASE` is unset, so the frontend will use relative `/api/*` paths (and your dev proxy or local backend host will handle them).
- Production: set `VITE_API_BASE` in Vercel to the backend deployment URL. The frontend will call `${VITE_API_BASE}/api/...`.

Example (Vercel Dashboard)

1. Go to your frontend project in Vercel.
2. Settings → Environment Variables → Add:
   - Key: `VITE_API_BASE`
   - Value: `https://<your-backend-deployment>.vercel.app`
   - Environment: `Production` (and optionally `Preview`)

If you want, I can add a runtime fallback to read the backend base from window location (for example, when backend is served from a different subpath).
