# Palak Aluminium — Frontend Design Document

> Design & architecture reference for the `indusedge-frontend` application — a public
> product catalog and inquiry portal for an aluminium products supplier, backed by an
> integrated admin CMS.

---

## 1. Overview

Palak Aluminium is a single-page application (SPA) that serves two audiences:

- **Public visitors** — browse aluminium product categories, view product detail/specs,
  search, and submit product inquiries.
- **Admins** — manage products, categories/sections, inquiries, and media
  through a protected CMS at `/admin`.

The app is designed to be **resilient**: it talks to a backend API when available and
transparently falls back to `localStorage` when the API is unreachable, so the catalog
always renders.

---

## 2. Tech Stack

| Concern           | Choice                                             |
| ----------------- | -------------------------------------------------- |
| Framework         | React 19 (`react`, `react-dom`)                    |
| Language          | TypeScript                                         |
| Build tool        | Vite 6 (`@vitejs/plugin-react`)                    |
| Routing           | React Router 7 (`HashRouter`)                      |
| Styling           | Tailwind CSS (via CDN + inline `tailwind.config`)  |
| Icons             | `lucide-react`                                     |
| Fonts             | Inter (Google Fonts)                               |
| Spreadsheet I/O   | `xlsx` (admin data export/import)                  |
| AI (optional)     | `@google/genai` (Gemini)                           |
**Dev server:** Vite on port `3000`, proxying `/api` → `http://localhost:5001`.

---

## 3. Application Architecture

### 3.1 Entry & Bootstrap

```
index.html  →  index.tsx  →  <App />
```

- `index.html` loads Tailwind (CDN), Inter font, an import map for ESM CDN modules, and
  the root stylesheet. `<body>` sets the base theme: `bg-slate-50 text-slate-900`.
- `App.tsx` runs a **backend warm-up loop** on mount: it polls `/api/ping` until the API
  responds with `{ database: "connected" }`, showing an animated `Preloader` (factory logo
  + progress bar) with live status messages. Only once ready does it render the router.
  This gracefully covers cold-start latency on serverless/free-tier backends.

### 3.2 Routing

Uses `HashRouter` (URLs like `/#/products`) — no server rewrite config needed for static
hosting. Routes are split into a **public shell** and an **admin area**.

**Public** (wrapped in `<Header /> … <Footer />`):

| Path             | Component        | Notes                          |
| ---------------- | ---------------- | ------------------------------ |
| `/`              | `Home`           | Landing page                   |
| `/products`      | `ProductCatalog` | Supports `?category=<id>`      |
| `/product/:id`   | `ProductDetail`  |                                |
| `/inquiry`       | `InquiryPage`    | Map + contact + `InquiryForm`  |
| `/categories`    | → redirect `/`   | Legacy                         |
| `/about`         | → redirect `/inquiry` | Legacy                    |
| `/contact`       | → redirect `/inquiry` | Legacy                    |

**Admin:**

| Path                    | Component             | Notes                    |
| ----------------------- | --------------------- | ------------------------ |
| `/admin/login`          | `Login`               | Auth gate                |
| `/admin` (layout)       | `AdminLayout`         | Wraps protected routes   |
| `/admin` / `dashboard`  | `Dashboard`           |                          |
| `/admin/sections`       | `ManageSections`      | Categories               |
| `/admin/products`       | `ManageProducts`      |                          |
| `/admin/inquiries`      | `ManageInquiries`     |                          |
| `/admin/media`          | `ImageUpload`         | Media library            |

---

## 4. Data Layer & Resilience Strategy

All data access is centralized in [`services/db.ts`](services/db.ts). This is the single
source of truth for the frontend's data contract.

### 4.1 Fallback pattern

`fetchWithFallback()` wraps every request:

1. Call the real API (`/api/...`).
2. On success — return the data and **sync it into `localStorage`** (for `GET`s).
3. On failure — log a `[IndusEdge Resilience]` warning and return the **local copy**.

On first load, `initLocalStore()` seeds `localStorage` from the bundled defaults in
[`constants.ts`](constants.ts) (`PRODUCTS`, `CATEGORIES`) so the catalog is never empty.

### 4.2 Storage keys

Namespaced under `indusedge_*`:

```
indusedge_products_v1     indusedge_categories_v1
indusedge_inquiries_v1    indusedge_images_v1
indusedge_token           indusedge_theme
```

### 4.3 API surface (via `db`)

- **Categories:** `getCategories`, `saveCategory`, `deleteCategory`
- **Products:** `getProducts`, `getProductById`, `saveProduct`, `deleteProduct`
- **Inquiries:** `getInquiries`, `addInquiry`, `updateInquiryStatus`, `deleteInquiry`
- **Media:** `getImages`, `uploadImage` (multipart), `deleteImage`, `updateImageCategory`
- **Auth:** `login`, `logout`, `isLoggedIn` (token in `localStorage`)
- **Health:** `checkHealth` (used by warm-up)

> **Note:** `login` has an offline demo fallback (`admin` / `password123`). This is a
> convenience for local dev — it should not ship to production as-is.

### 4.4 Core data models ([`types.ts`](types.ts))

- `Product` — `id, name, categoryId, description, shortDescription, images[], specs{}, isFeatured, isActive`
- `Category` — `id, name, description, image, icon, isActive`
- `Inquiry` — `id, productId?, customerName, phone, message, status, createdAt`
  - `InquiryStatus = "NEW" | "CONTACTED" | "CLOSED"`
- `InquiryFormData` — form payload for a new inquiry
- `ImageAsset` — `id, url, publicId, name, categoryId?, uploadedAt`

---

## 5. Design System

The visual language is a **bold, industrial, high-contrast** look — heavy uppercase
typography, generous rounding, and a single strong accent color.

### 5.1 Color palette (Tailwind)

| Role              | Tokens                                             |
| ----------------- | -------------------------------------------------- |
| Accent / brand    | `blue-600` (primary), `blue-500`/`blue-400` (light), `blue-700` (deep) |
| Neutrals (text)   | `slate-900` (headings), `slate-600`/`slate-500` (body), `slate-400` (muted) |
| Surfaces          | `white` (cards), `slate-50` (page bg), `slate-900` (dark panels/footer) |
| Borders           | `slate-100` / `slate-200`                          |
| Status            | `green-500` (available/online), status pulse dots  |

Brand wordmark: `PALAK` in a blue gradient (`from-blue-700 to-blue-500`) + `ALUMINIUM`
in `slate-900`, paired with a `Factory` icon in a blue rounded tile.

### 5.2 Typography

- **Font:** Inter (weights 300–700).
- **Headings:** `font-black`, `uppercase`, `tracking-tighter`, large responsive sizes
  (e.g. `text-4xl md:text-7xl`).
- **Labels/eyebrows:** tiny + heavy — `text-[10px] font-black uppercase tracking-widest`
  (or `tracking-[0.2em]`/`[0.5em]` for pill labels).
- **Body:** `font-medium`, `text-slate-500`, relaxed leading.

### 5.3 Shape, elevation & motion

- **Radius:** heavily rounded — `rounded-xl`/`2xl` for controls, up to
  `rounded-[3rem]`/`rounded-[4rem]` for feature cards.
- **Shadows:** layered, often tinted (`shadow-2xl shadow-blue-500/20`).
- **Motion:** `transition-all` on interactive elements; hover `scale-105`, active
  `scale-95`; entrance animations via `animate-in fade-in slide-in-from-top`; pulse dots;
  a custom `@keyframes loading` bar in the preloader.

### 5.4 Recurring UI patterns

- **Pill label / eyebrow:** dark rounded-full chip with wide-tracked uppercase micro-text.
- **Icon tile:** accent-colored padded rounded square holding a Lucide icon.
- **Glow accent:** blurred blue radial (`blur-[80px]`) behind dark panels.
- **Status chip:** white pill + pulsing green dot + hours/availability text.

### 5.5 Theming

[`contexts/ThemeContext.tsx`](contexts/ThemeContext.tsx) provides `light`/`dark` theme
state, persisted to `indusedge_theme`, toggling the `dark` class on `<html>`. Default is
**light**. Many components already carry `transition-colors` hooks for dark mode.

> **Status:** the theme plumbing exists, but `ThemeProvider` is not yet wired around
> `<App />` in `index.tsx`, and most surfaces don't yet define `dark:` variants. Dark mode
> is a partially-built capability, not a finished feature.

---

## 6. Layout & Navigation ([`components/Layout.tsx`](components/Layout.tsx))

### Header

- Sticky, white, `z-50`, blur/shadow on scroll.
- Brand wordmark → `/`.
- **Global search** (desktop `lg+`): debounced (500ms) live search across products
  (name + specs) and categories, results in a dropdown; caches the dataset after first
  fetch; closes on outside click.
- Nav links: Home / Products / Inquiry with active-state highlighting.
- Mobile: hamburger panel with search, links, and an availability strip.

### Footer

Dark (`slate-900`) 3-column grid: brand blurb, Navigation, and Contact details.
Admin login is reached directly via `/admin/login` (no public footer link).

---

## 7. Admin CMS (`/admin`)

Gated by `AdminLayout` (token check via `db.isLoggedIn`). Modules:

- **Dashboard** — overview.
- **ManageSections** — CRUD categories.
- **ManageProducts** — CRUD products (specs, images, featured/active flags).
- **ManageInquiries** — triage inquiries (`NEW → CONTACTED → CLOSED`), delete.
- **ImageUpload** — media library (multipart upload, categorize, delete).

`xlsx` supports spreadsheet import/export of catalog data within the admin modules.

---

## 8. Folder Structure

```
frontend/
├── index.html            # Tailwind CDN, fonts, import map, root
├── index.tsx             # React entry
├── App.tsx               # Warm-up + router + InquiryPage
├── constants.ts          # Seed CATEGORIES & PRODUCTS
├── types.ts              # Domain models
├── vite.config.ts        # Dev server, /api proxy, aliases
├── tsconfig.json
├── components/
│   ├── Layout.tsx        # Header + Footer
│   └── InquiryForm.tsx   # Inquiry submission form
├── contexts/
│   └── ThemeContext.tsx  # Light/dark theme
├── pages/
│   ├── Home.tsx
│   ├── ProductCatalog.tsx
│   ├── ProductDetail.tsx
│   ├── Categories.tsx    # (legacy)
│   ├── Contact.tsx       # (legacy)
│   └── admin/
│       ├── AdminLayout.tsx
│       ├── Login.tsx
│       ├── Dashboard.tsx
│       ├── ManageSections.tsx
│       ├── ManageProducts.tsx
│       ├── ManageInquiries.tsx
│       └── ImageUpload.tsx
└── services/
    └── db.ts             # API + localStorage fallback
```

---

## 9. Conventions & Notes

- **Styling:** utility-first Tailwind inline in JSX; no separate CSS modules. Keep the
  design-system tokens above (accent, neutrals, heavy uppercase type, large radii).
- **Icons:** import from `lucide-react`; wrap in accent icon-tiles for emphasis.
- **Data:** always go through `services/db.ts` — never `fetch` domain data directly in a
  component (search in `Layout.tsx` is the one place that then caches into local state).
- **IDs/keys:** `localStorage` keys are versioned (`_v1`) — bump when the shape changes.
- **Legacy routes** redirect rather than 404, preserving old links.

### Known gaps / follow-ups

- Wire `ThemeProvider` around the app and add `dark:` variants to complete dark mode.
- Remove the hardcoded offline login fallback before production.
- Tailwind is loaded via CDN — consider a build-time Tailwind setup for production
  (smaller payload, no runtime config, purged CSS).
```
