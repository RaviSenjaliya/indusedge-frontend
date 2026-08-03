# IndusEdge Frontend

Vite + React 19 storefront and admin panel for the IndusEdge / Palak Aluminium
catalog. Deployed as a **Render Static Site**.

Backend lives in its own repo: **indusedge-backend** (Express + MongoDB Atlas,
deployed as a Render Web Service).

## Local development

```bash
npm install
npm run dev            # http://localhost:3000
```

Leave `VITE_API_BASE_URL` unset locally — requests to `/api` are proxied to the
backend at `http://localhost:5002` (override with `DEV_API_PROXY` in
`.env.local`). Run the backend repo alongside, or the app serves its bundled
localStorage fallback data.

## Deployment (Render Static Site)

Render Dashboard → **New → Blueprint** → select this repo; `render.yaml`
defines the static site (build command, publish path, SPA rewrite, caching).
When prompted, set:

```
VITE_API_BASE_URL = https://<your-backend-service>.onrender.com/api
```

Include the `/api` suffix, no trailing slash. The value is baked in at
**build time** — changing it later requires a redeploy
(Manual Deploy → Clear build cache & deploy), not a restart.

After the first deploy, add this site's URL to the backend's `CORS_ORIGINS`
(e.g. `https://indusedge-frontend.onrender.com`).

The `routes` rewrite in `render.yaml` sends every path to `index.html` so
react-router deep links survive refresh.

## Scripts

| Command             | Purpose                          |
| ------------------- | -------------------------------- |
| `npm run dev`       | Dev server with `/api` proxy     |
| `npm run build`     | Production build to `dist/`      |
| `npm run preview`   | Serve the production build       |
| `npm run typecheck` | `tsc --noEmit`                   |
