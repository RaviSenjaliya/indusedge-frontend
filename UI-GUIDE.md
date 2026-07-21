# Palak Aluminium — UI Building Guide

> A practical, copy-paste cookbook for building new UI that matches the existing
> **bold industrial** look. Every token and snippet here is extracted from real
> components ([App.tsx](App.tsx), [components/Layout.tsx](components/Layout.tsx),
> [components/InquiryForm.tsx](components/InquiryForm.tsx),
> [pages/Home.tsx](pages/Home.tsx)). For architecture & data flow, see
> [DESIGN.md](DESIGN.md).

---

## 0. The one-paragraph brief

Heavy, uppercase, wide-tracked typography on a light slate canvas, a single blue
accent, and **very** large corner radii. Cards are white with hairline slate
borders and soft shadows; dark panels (`slate-900`) carry a blurred blue glow.
Everything interactive animates — hover lifts/scales, active shrinks. When in
doubt: rounder, bolder, more uppercase.

---

## 1. Design tokens (memorize these)

### Colors — use ONLY these
| Role | Token(s) |
| --- | --- |
| Brand accent | `blue-600` (primary), `blue-700` (hover/deep), `blue-500`/`blue-400` (light/on-dark) |
| Text — heading | `text-slate-900` |
| Text — body | `text-slate-500` (also `slate-600`) |
| Text — muted / eyebrow | `text-slate-400` |
| Page background | `bg-slate-50` |
| Card / surface | `bg-white` |
| Dark panel / footer | `bg-slate-900` (deepest hero: `slate-950`) |
| Borders | `border-slate-100` (hairline) · `border-slate-200` (standard) |
| Status — available/online | `green-500` / `emerald-500` |

> Do **not** introduce new hues. Indigo (`indigo-400`) appears only inside the
> hero gradient. Stay on the blue/slate axis.

### Typography scale
| Use | Classes |
| --- | --- |
| Hero title | `text-4xl md:text-8xl font-black tracking-tighter leading-[0.9]` |
| Page H1 | `text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none` |
| Section H2 | `text-3xl md:text-6xl font-black uppercase tracking-tighter` |
| Card title | `text-2xl font-black uppercase tracking-tighter` |
| Body | `font-medium text-slate-500 leading-relaxed` |
| **Eyebrow / label** | `text-[10px] font-black uppercase tracking-[0.2em]` (or `tracking-widest`) |
| Micro label | `text-[9px] font-black uppercase tracking-[0.3em]` |

Rules: headings are **always** `font-black` + `uppercase` + tight tracking.
Labels are **always** tiny + `font-black` + `uppercase` + wide tracking. Body is
the only lowercase, `font-medium` text.

### Radius
| Element | Radius |
| --- | --- |
| Inputs, small buttons, icon-tiles | `rounded-xl` / `rounded-2xl` |
| Cards | `rounded-[2.5rem]` / `rounded-[3rem]` |
| Hero / feature panels | `rounded-[3.5rem]` / `rounded-[4rem]` |
| Pills, dots, avatars | `rounded-full` |

### Shadow & motion
- Shadows are soft and often **blue-tinted**: `shadow-xl shadow-blue-500/20`,
  `shadow-2xl shadow-blue-600/30`. Big cards use a custom drop:
  `hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)]`.
- Motion vocabulary: `transition-all`, hover `scale-105` / `-translate-y`,
  active `active:scale-95`, images `group-hover:scale-110` over
  `duration-1000`, entrances `animate-in fade-in slide-in-from-top duration-300`.

### Spacing rhythm
- Page container: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`.
- Section padding: `py-16 md:py-24` (up to `py-20 md:py-32` for big segments).
- Card inner padding: `p-8` → `p-8 md:p-12` → `p-12 md:p-20` (forms).

---

## 2. Component recipes (copy-paste)

### Eyebrow pill (dark)
```tsx
<div className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.5em] py-2.5 px-8 rounded-full w-fit mx-auto mb-8 shadow-2xl">
  Get in Touch
</div>
```

### Eyebrow pill (blue)
```tsx
<div className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-xl shadow-blue-500/20">
  <Layers className="h-3 w-3" /> <span>Product Categories</span>
</div>
```

### Icon tile (accent square holding a Lucide icon)
```tsx
<div className="bg-blue-600 p-3 rounded-2xl shadow-xl shadow-blue-500/20">
  <MapPin className="h-6 w-6 text-white" />
</div>
```

### Primary button (accent)
```tsx
<Link to="/products"
  className="inline-flex items-center justify-center bg-blue-600 text-white px-8 md:px-10 py-4 md:py-5 rounded-2xl font-black text-xs md:text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/30">
  Browse Products <ArrowRight className="ml-3 h-5 w-5" />
</Link>
```

### Dark button (invert-on-hover to accent) — the workhorse CTA
```tsx
<button
  className="w-full bg-slate-900 hover:bg-blue-600 text-white font-black py-5 px-10 rounded-2xl flex items-center justify-center space-x-3 transition-all shadow-xl hover:shadow-blue-600/20 active:scale-95 disabled:opacity-50">
  <span className="text-xs uppercase tracking-[0.2em]">Send Inquiry</span>
  <Send className="h-4 w-4" />
</button>
```

### Secondary / ghost button (on dark backgrounds)
```tsx
<Link to="/inquiry"
  className="inline-flex items-center justify-center bg-white/5 text-white border border-white/20 backdrop-blur-lg px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all">
  Request Quote
</Link>
```

### Input with leading icon (the standard form field)
```tsx
<div className="relative group">
  <User className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
  <input
    className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-medium"
    placeholder="Your Name *" />
</div>
```
> Focus signature everywhere: `focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600`.

### White content card
```tsx
<div className="bg-white p-8 md:p-12 rounded-[3rem] border border-slate-100 shadow-sm transition-colors">
  {/* ... */}
</div>
```

### Dark feature panel with blue glow
```tsx
<div className="bg-slate-900 rounded-[3rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden group">
  <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600/20 rounded-full blur-[80px] -mr-20 -mt-20 group-hover:bg-blue-600/40 transition-colors" />
  <div className="relative z-10">{/* content sits above the glow */}</div>
</div>
```

### Status chip (pulsing dot + availability)
```tsx
<div className="bg-white px-5 py-2.5 rounded-full border border-slate-200 shadow-sm flex items-center space-x-3 w-fit">
  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
  <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">
    Mon - Sat: 09:00 - 19:00
  </span>
</div>
```

### "Ping" live indicator (animated ring — used in hero)
```tsx
<span className="relative flex h-2 w-2">
  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
</span>
```

### Circular arrow affordance (bottom-right of cards)
```tsx
<div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
  <ArrowRight className="h-5 w-5" />
</div>
```

### Spec chip (tiny key/value pill)
```tsx
<div className="bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
  <span className="text-[7px] font-black text-slate-400 uppercase mr-2">GRADE:</span>
  <span className="text-[8px] font-bold text-slate-900">6061-T6</span>
</div>
```

---

## 3. Page-level patterns

### Section header (eyebrow → H2 → lead paragraph, centered)
```tsx
<div className="text-center mb-12 md:mb-20">
  {/* eyebrow pill here */}
  <h2 className="text-3xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter mb-6">
    Our Products
  </h2>
  <p className="text-slate-500 max-w-2xl mx-auto font-medium text-lg leading-relaxed">
    Explore our comprehensive range of aluminium products.
  </p>
</div>
```

### Dark hero with image + gradient scrim
```tsx
<section className="relative min-h-[600px] md:h-[700px] flex items-center overflow-hidden">
  <div className="absolute inset-0 z-0 scale-105">
    <img src="…" className="w-full h-full object-cover brightness-[0.2]" alt="" />
    <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950/80 to-transparent" />
  </div>
  <div className="relative z-10 max-w-7xl mx-auto px-4 w-full">{/* content */}</div>
</section>
```
> Gradient accent on a word: `text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-400`.

### Card grid
`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8` — end category grids with
the dark **"Custom Orders"** CTA card so the grid never looks half-empty.

### Loading spinner (page-level)
```tsx
<div className="min-h-screen flex items-center justify-center bg-slate-50">
  <div className="flex flex-col items-center space-y-4">
    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    <span className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Loading…</span>
  </div>
</div>
```

### Empty state
```tsx
<div className="py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200">
  <AlertCircle className="h-10 w-10 text-slate-300 mx-auto mb-4" />
  <p className="text-slate-400 font-bold">No items found. Please check back later.</p>
</div>
```

### Success state (after form submit)
Swap the whole form for a centered card: green check in a `bg-green-50` circle,
`animate-in zoom-in duration-500`, black uppercase heading, muted body, and a
text-link to reset. See [InquiryForm.tsx](components/InquiryForm.tsx#L70).

---

## 4. Responsive & interaction rules

- **Mobile-first**: base classes target phones; layer `md:`/`lg:` up. Type
  roughly doubles at `md` (`text-4xl md:text-8xl`).
- **Hover choreography** lives on a parent `group`; children react with
  `group-hover:*`. Use nested `group/item` when a card has its own hover targets
  (see the contact rows in [App.tsx](App.tsx#L139)).
- **Touch feedback**: every button gets `active:scale-95`.
- **Images**: `object-cover`, often `grayscale` at rest →
  `group-hover:grayscale-0` + slow `scale-110` zoom over `duration-1000`.
- **Icons**: always `lucide-react`, sized `h-4 w-4`…`h-6 w-6`; wrap in an icon
  tile for emphasis.

---

## 5. Checklist before you ship a screen

- [ ] Container is `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`.
- [ ] Only blue/slate colors; green/emerald reserved for "live/available".
- [ ] Headings `font-black uppercase tracking-tighter`; labels tiny + wide-tracked.
- [ ] Radii are large (`rounded-2xl`+ for controls, `rounded-[2.5rem]`+ for cards).
- [ ] Every interactive element has a hover **and** `active:scale-95` state.
- [ ] Inputs use the shared focus ring `focus:ring-4 focus:ring-blue-500/10`.
- [ ] Loading, empty, and success states are all handled.
- [ ] All data reads go through [services/db.ts](services/db.ts) — never `fetch`
      domain data directly in a component.
- [ ] Icons imported from `lucide-react`; new pages register any dynamic icon in
      the page's `IconMap` (pattern in [Home.tsx](pages/Home.tsx#L25)).

---

## 6. Known gaps to respect

- **Dark mode** is only partially wired (theme context exists but isn't provided
  around `<App />`, and most surfaces lack `dark:` variants). Add `dark:`
  variants as you build if you touch a surface — see [DESIGN.md](DESIGN.md) §5.5.
- Tailwind is loaded via **CDN** today; keep to standard utility classes so a
  future build-time Tailwind migration is painless.
