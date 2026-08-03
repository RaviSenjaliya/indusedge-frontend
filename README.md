# IndusEdge Frontend

Vite + React 19 storefront and admin panel for the IndusEdge / Palak Aluminium
catalog.

Backend lives in its own repo: **indusedge-backend** (Express + MongoDB Atlas,
deployed on Render).

## Local development

```bash
npm install
npm run dev            # http://localhost:3000
```

Leave `VITE_API_BASE_URL` unset locally — requests to `/api` are proxied to the
backend at `http://localhost:5002` (override with `DEV_API_PROXY` in
`.env.local`). Run the backend repo alongside, or the app serves its bundled
localStorage fallback data.

## Deployment (Vercel)

Vercel Dashboard → Add New → Project → import this repo. Framework preset:
Vite (auto-detected); build settings come from [vercel.json](vercel.json).

**Required environment variable** (Production + Preview):

```
VITE_API_BASE_URL = https://<your-render-service>.onrender.com/api
```

Include the `/api` suffix, no trailing slash. The value is baked in at build
time — changing it requires a redeploy.

After the first deploy, add the Vercel domain to the backend's `CORS_ORIGINS`
(e.g. `https://indusedge-frontend.vercel.app,https://*.vercel.app`).

`vercel.json` rewrites all paths to `index.html` so react-router deep links
survive refresh.

## Scripts

| Command             | Purpose                          |
| ------------------- | -------------------------------- |
| `npm run dev`       | Dev server with `/api` proxy     |
| `npm run build`     | Production build to `dist/`      |
| `npm run preview`   | Serve the production build       |
| `npm run typecheck` | `tsc --noEmit`                   |
