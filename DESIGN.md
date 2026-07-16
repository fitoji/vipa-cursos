# VipaBase — Design Document

Personal Vipassana meditation course tracker. A calm, purposeful tool for practitioners to log courses they've attended or served at, track streaks, and explore meditation locations worldwide.

Deployed on Vercel. Live at `vipabase.vercel.app`.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| React | 19.2 |
| Styling | Tailwind CSS 4 (CSS-first config, oklch colors) |
| UI Components | shadcn/ui (`base-new-york` style) + Base UI (`@base-ui/react` 1.6) |
| Database | Neon Serverless PostgreSQL |
| Auth | Better Auth |
| State | React Query (`@tanstack/react-query` 5.x) |
| Tables | `@tanstack/react-table` 8.x |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |
| i18n | next-intl (es/en) |
| Theme | next-themes (light/dark) |
| Analytics | Vercel Analytics |
| Package Manager | pnpm 11.11 (corepack) |

No test runner. No CI workflows. No JS motion libraries (all CSS-driven).

---

## Design Tokens

### Colors (oklch)

**Light mode:**

| Token | Value | Usage |
|---|---|---|
| `--primary` | `oklch(0.5676 0.2021 283.0838)` | Deep violet — main brand color |
| `--primary-foreground` | `oklch(1 0 0)` | White on primary |
| `--background` | `oklch(0.9821 0.005 117)` | Warm off-white |
| `--foreground` | `oklch(0.3211 0.005 117)` | Dark warm gray |
| `--card` | `oklch(1 0.003 117)` | Pure white cards |
| `--muted` | `oklch(0.8202 0.008 117)` | Light warm gray |
| `--accent` | `oklch(0.6475 0.0642 117.426)` | Warm gold |
| `--destructive` | `oklch(0.6368 0.2078 25.3313)` | Red for deletes/errors |
| `--border` | `oklch(0.8699 0.005 117)` | Subtle warm border |

**Dark mode** (`.dark` class):

| Token | Value | Usage |
|---|---|---|
| `--background` | `oklch(0.2303 0.008 140)` | Dark warm green-gray |
| `--card` | `oklch(0.321 0.008 140)` | Elevated dark surface |
| `--primary` | `oklch(0.5676 0.2021 283.0838)` | Same violet (unchanged) |
| `--secondary` | `oklch(0.339 0.1793 301.6848)` | Deep purple |
| `--accent` | `oklch(0.6746 0.1414 261.338)` | Blue-violet |
| `--muted` | `oklch(0.3867 0.008 140)` | Dark muted surface |

### Typography

| Token | Font | Usage |
|---|---|---|
| `--font-sans` | Montserrat | Body text, UI |
| `--font-serif` | Playfair Display | Headings, emphasis |
| `--font-mono` | Source Code Pro | Code, technical |

### Spacing & Radius

| Token | Value |
|---|---|
| `--radius` | `0.5rem` (8px) |

### Shadows

oklch-based shadow scale from `--shadow-2xs` to `--shadow-2xl`. Dark mode uses higher opacity variants.

---

## Animation Conventions

This is a **meditation app** — motion feels calm, unhurried, and fluid. Not a crisp dashboard.

### Easing

All transitions use `cubic-bezier(0.4, 0, 0.2, 1)` — a smooth ease-out with no abrupt stops. Defined inline per declaration (no CSS variable yet).

### Duration Scale

| Element | Duration | Rationale |
|---|---|---|
| View transitions (page nav) | 450ms | Crossfade between pages — unhurried |
| Entrance animations (fade-up, scale-in, etc.) | 400–600ms | Content appearing — calm reveal |
| Hover effects | 250ms | Interactive feedback — responsive but not instant |
| Press feedback | 140ms | Tactile response — fast enough to feel connected |

### Touch Safety

All `:hover` rules are gated behind `@media (hover: hover) and (pointer: fine)`. Touch devices get press feedback only — no sticky hover.

```css
@media (hover: hover) and (pointer: fine) {
  .hover-lift:hover { transform: translateY(-3px); }
}
```

### Reduced Motion

`@media (prefers-reduced-motion: reduce)` block at the bottom of `globals.css` disables all animations and transforms using `!important`. Keeps opacity feedback, drops movement.

### Base UI Overlays

Dialog, Select, Popover, Menu, Tooltip use CSS-driven enter/exit via `data-starting-style` / `data-ending-style` — no JS animation props. Pattern:

```css
data-starting-style:opacity-0 data-starting-style:scale-95
data-ending-style:opacity-0 data-ending-style:scale-95
```

### View Transitions

Use `document.startViewTransition()` via `TransitionLink` and `useTransitionRouter`. Crossfade only (opacity), no blur. Old view fades to 0, new view fades from 0.

---

## Component Architecture

### Layout

```
src/app/[locale]/layout.tsx
├── <html> (lang, font variables, suppressHydrationWarning)
├── <body> (flex h-screen flex-col)
│   ├── <SiteHeader /> (sticky, avatar dropdown, theme toggle, locale switcher)
│   ├── <main> (flex-1 overflow-y-auto) ← scrollable content area
│   │   └── {children} (page content)
│   └── <SiteFooter />
├── <Toaster /> (sonner, bottom-right)
└── <Providers> (QueryClientProvider, NextIntlClientProvider, ThemeProvider)
```

### Page Components

| Route | Component | Description |
|---|---|---|
| `/` | `LandingView` | Hero section, feature cards, CTA |
| `/login` | `LoginForm` | Email/password + Google OAuth |
| `/dashboard` | `DashboardView` | Stat cards, data table, charts, import |
| `/cursos` | `CursosView` | Course entry form (date, days, type, notes) |
| `/racha` | `MeditationStreakTracker` | Streak management, edit/delete |
| `/ayuda` | `HelpView` | FAQ accordion, documentation |

### Shared Components

| Component | Purpose |
|---|---|
| `TransitionLink` | Link wrapper with View Transition API |
| `useTransitionRouter` | Hook wrapping `router.push` with View Transition API |
| `RefreshButton` | Data refresh with spin animation |
| `BackgroundPicker` | Sheet with nature photography grid |
| `BackgroundLayer` | Full-page background image with opacity/blur |
| `LocaleSwitcher` | Language toggle (es/en) |
| `AppSidebar` | Navigation sidebar |

### UI Components (shadcn/ui + Base UI)

All in `src/components/ui/`. Style: `base-new-york`, icons: `lucide`.

| Component | Base | Notes |
|---|---|---|
| Dialog | Base UI `Dialog` | CSS enter/exit via data attributes |
| AlertDialog | Base UI `Dialog` | Same pattern as Dialog |
| Sheet | Base UI `Dialog` | Slide-in from side |
| Select | Base UI `Select` | `positionMethod="fixed"`, `alignItemWithTrigger={false}` |
| Popover | Base UI `Popover` | `positionMethod="fixed"` |
| DropdownMenu | Base UI `Menu` | `positionMethod="fixed"`, `DropdownMenuLabel` is plain `<div>` |
| Tooltip | Base UI `Tooltip` | `positionMethod="fixed"` |
| Accordion | Base UI | Height animation via `data-starting-style:h-0` |
| Button | shadcn | `transition-colors` only |
| Input/Textarea | shadcn | No animations |
| Card | shadcn | Static |
| Badge | shadcn | Static |
| Table | shadcn | Static |
| Skeleton | shadcn | `animate-pulse` |
| Progress | shadcn | `transition-all` on indicator |
| Sidebar | shadcn | `transition-[width]` for collapse/expand |

### Critical Base UI Patterns

**Positioner z-index**: Base UI Positioners with `position: fixed` need `z-index` on the **Positioner element itself** (not just the inner Popup). Without it, popups render behind content due to stacking context competition with `<main>`'s `overflow-y-auto`.

```tsx
<Select.Positioner className="z-50" positionMethod="fixed">
```

**`style` prop ignored**: Base UI Positioners silently ignore `style` props. Use `className` instead.

**`Menu.GroupLabel` requires `<Group>`**: Unlike Radix, Base UI's `Menu.GroupLabel` must be inside a `<Menu.Group>`. `DropdownMenuLabel` uses a plain `<div>` instead.

---

## Routes & Data Flow

### Authentication

Better Auth handles session management. `getSession()` called in server components and client-side via React Query. Auth state checked in `Providers` wrapper.

### Database Access

All DB access through Server Actions in `src/app/actions/courses.ts` (marked `"use server"`). Neon serverless driver via `process.env.DATABASE_URL`. Actions call `revalidatePath` after mutations. Client components call Server Actions directly (no `useServerFn` wrapper).

### Data Fetching

React Query wraps the app. Query key: `["courses"]`. Mutations invalidate via `qc.invalidateQueries({ queryKey: ["courses"] })`.

---

## Gotchas & Lessons Learned

### Base UI Migration (Radix → Base UI)

- All 25 `@radix-ui/*` packages removed, replaced by `@base-ui/react` 1.6
- `DropdownMenuLabel` changed from `Menu.GroupLabel` to plain `<div>` (Base UI requires `<Group>` context)
- Positioner z-index is THE critical fix — without `className="z-50"` on Positioners, popups render behind content
- `positionMethod="fixed"` needed on all Positioners for correct viewport-relative positioning
- `alignItemWithTrigger={false}` makes Select behave like Radix (standard Floating UI)

### Animation Discoveries

- `box-shadow` animations conflict with Tailwind's `ring` utilities (both use `box-shadow`). Use `outline` for animated rings instead.
- View transitions: blur causes "cut off" look. Crossfade with opacity only is cleaner.
- Old view must fade to 0 opacity (not 0.5) — otherwise ghosting occurs.
- `overflow-hidden` on body was removed — it clipped positioned elements.

### Database

- `DATABASE_URL` must use `sslmode=verify-full` (NOT `require`). In pg v9, `require` stops validating certificates.
- `pnpm-workspace.yaml` exists only for `minimumReleaseAge: 0` — NOT a monorepo.

### Build

- `next build` does not need the DB
- `next dev` hits Neon only on request
- `next-env.d.ts` is auto-generated — never edit

---

## File Structure

```
src/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx          # Root layout (fonts, providers, header/footer)
│   │   ├── page.tsx            # Landing page (/)
│   │   ├── login/page.tsx      # Login page
│   │   ├── dashboard/page.tsx  # Dashboard (dynamic import, SSR: false)
│   │   ├── cursos/page.tsx     # Course entry form
│   │   ├── racha/page.tsx      # Streak tracker
│   │   ├── ayuda/page.tsx      # Help/FAQ page
│   │   ├── error.tsx           # Error boundary
│   │   └── not-found.tsx       # 404 page
│   ├── actions/
│   │   └── courses.ts          # Server Actions (DB access)
│   ├── globals.css             # Tailwind config, tokens, animations
│   └── providers.tsx           # QueryClientProvider wrapper
├── components/
│   ├── ui/                     # shadcn/ui + Base UI components
│   ├── *.tsx                   # Feature components
│   └── transition-*.tsx        # View Transition wrappers
├── i18n/                       # next-intl config
├── lib/
│   ├── utils.ts                # cn() utility
│   └── animations.ts           # useInView, useCountUp, staggerDelay
└── hooks/                      # Custom hooks
```
