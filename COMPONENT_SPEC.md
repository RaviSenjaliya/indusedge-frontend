# Palak Admin UI Kit — Usage Spec

Authoritative reference for the reusable admin component library in
`components/ui/` (barrel: `components/ui/index.ts`) and `components/admin/`.
All admin pages MUST be built from these components. Source of truth for props
is the component source; this spec summarizes the API and the house rules.

## Import paths (from `pages/admin/*.tsx`)

```tsx
import {
  Button, buttonClass, IconButton, Badge, INQUIRY_STATUS_TONE, INQUIRY_STATUS_LABEL,
  Card, GlowPanel, StatCard, DataTable, Column,
  Input, Textarea, Select, Switch, SearchInput, FieldLabel,
  Modal, ModalHeader, ModalBody, ModalFooter,
  PageHeader, EmptyState, Spinner, Loader,
  Skeleton, SkeletonText, SkeletonCard, SkeletonStat, SkeletonTable,
  useToast, useConfirm, cn,
} from "../../components/ui";
import { MediaLibraryModal } from "../../components/admin/MediaLibraryModal";
```

`ToastProvider`/`ConfirmProvider` are already mounted by `AdminLayout` — pages
just call the hooks. EXCEPTION: `Login.tsx` renders OUTSIDE `AdminLayout`, so
it must NOT call `useToast`/`useConfirm` (use inline error UI there).

## Component API (summary)

| Component | Key props |
| --- | --- |
| `Button` | `variant`: `primary`\|`dark`\|`subtle`\|`ghost`\|`danger`\|`outline` · `size`: `sm`\|`md`\|`lg` · `fullWidth` · `loading` · `leftIcon`/`rightIcon` (Lucide component) |
| `buttonClass(opts)` | Same `variant`/`size`/`fullWidth`/`className` — for styling `<Link>`/`<label>` like a Button |
| `IconButton` | `icon` (Lucide) · `label` (required, a11y + tooltip) · `variant`: `default`\|`primary`\|`danger`\|`ghost`\|`dark` · `size`: `sm`\|`md`\|`lg` |
| `Badge` | `tone`: `blue`\|`green`\|`amber`\|`red`\|`slate`\|`indigo` · `icon` · `dot` (pulsing) |
| `Card` | `padding`: `none`\|`sm`\|`md`\|`lg` — white/dark surface, big radii |
| `GlowPanel` | `padding`: `md`\|`lg` — dark slate panel + blue glow (content auto z-raised) |
| `StatCard` | `label` · `value` · `icon` · `tone`: `blue`\|`indigo`\|`amber`\|`green`\|`red`\|`slate` |
| `Input` | `label` · `icon` · `error` · `dense` (filter bars) · `mono` (URLs/IDs) · `labelAction` (right slot) · `containerClassName` — all native input props pass through |
| `Textarea` | `label` · `error` · `labelAction` · `rows` |
| `Select` | `label` · `dense` — children are `<option>`s; chevron built in |
| `Switch` | `checked` · `onChange(boolean)` · `label` · `tone`: `green`\|`blue`\|`indigo` |
| `SearchInput` | `value` · `onChange(string)` · `placeholder` — icon + clear button built in |
| `Modal` | `open` · `onClose` · `size`: `sm`\|`md`\|`lg`\|`xl` · `animation`: `slide`\|`zoom` · `panelClassName` — Esc + scroll-lock + portal built in. Compose with `ModalHeader` (`title`,`subtitle`,`onClose`), `ModalBody`, `ModalFooter` |
| `DataTable<T>` | `columns: Column<T>[]` (`key`,`header`,`render(row)`,`align`,`className`) · `rows` · `rowKey(row)` · `onRowClick` · `loading` (renders skeleton) · `empty` (ReactNode) · `minWidth` |
| `PageHeader` | `title` · `subtitle` · `actions` (right slot) |
| `EmptyState` | `icon` · `title` · `message` · `action` · `framed` (adds dashed-card chrome — use ONLY when not nested in Card/DataTable) |
| `Skeleton*` | `Skeleton className` for shape; `SkeletonStat`, `SkeletonCard`, `SkeletonTable rows/columns`, `SkeletonText lines` |
| `useToast()` | `.success(title, msg?)` `.error()` `.info()` `.warning()` |
| `useConfirm()` | `await confirm({ title, message?, confirmLabel?, cancelLabel?, tone: "danger"\|"warning"\|"default" })` → `boolean` |
| `MediaLibraryModal` | `open` · `onClose` · `onSelect(url)` · `categories?` (pass if already loaded) |

## Hard rules (every page)

1. **No raw `alert()` / `window.confirm()`** — use `useToast` / `useConfirm`.
2. **No hand-rolled modals/tables/inputs/badges/spinners** — use the kit.
3. **Dark mode everywhere**: components handle themselves; any custom element
   needs `dark:` variants (text `dark:text-white`/`dark:text-slate-400`,
   surfaces `dark:bg-slate-900`, borders `dark:border-slate-800`).
4. **Loading = skeletons**, not spinners, for content areas (`DataTable
   loading`, `SkeletonStat`, `SkeletonCard`). Spinners only inside buttons
   (`Button loading`) or tiny inline waits.
5. **Every list screen has a real empty state** (`EmptyState` with an action),
   and filtered-to-zero shows "no matches + clear filters", not a blank table.
6. **Preserve ALL existing behavior**: every `db.*` call, state transition,
   validation rule, XLSX export, and navigation must survive the refactor.
   Validation failures surface as `toast.error(...)` instead of `alert(...)`.
7. **Icons**: `lucide-react` only.
8. **Copy tone**: professional, plain — "Delete product?", "Message", "Phone".
   No sci-fi jargon ("Close Matrix", "Secure Voice", "STAGE 1").
9. Page root: `<div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-12">`.
10. Do not add npm dependencies. Do not edit files outside your assigned page.

## Design tokens (recap)

Accent `blue-600` (hover `blue-700`); page bg `slate-50`/`dark:slate-950`;
cards `white`/`dark:slate-900`; borders `slate-100/200` / `dark:slate-800`;
headings `font-black tracking-tight`; micro-labels
`text-[9px-10px] font-black uppercase tracking-widest`; radii `rounded-xl`
(controls) → `rounded-[2rem+]` (cards); hover `transition-all`, press
`active:scale-95` (built into kit buttons).
