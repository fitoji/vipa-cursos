# vipa-base

Next.js 16 (App Router) + React 19 + Tailwind 4 + shadcn/ui + Neon (PostgreSQL).
Personal Vipassana course tracker. Deployed on Vercel.

## Commands

```bash
pnpm install          # packageManager: pnpm@11.11.0 (corepack)
pnpm dev              # next dev (SSR)
pnpm build            # next build
pnpm start            # next start (production server)
pnpm lint             # eslint flat config
pnpm format           # prettier --write .
```

No test runner is configured. No CI workflows exist.

## Architecture

- **Next.js App Router** — routes live in `src/app/`. `src/app/layout.tsx` is the root layout; `src/app/page.tsx` is `/`, `src/app/dashboard/page.tsx` is `/dashboard`.
- **Server Actions** for all DB access in `src/app/actions/courses.ts` (marked `"use server"`). They call Neon via `process.env.DATABASE_URL` and call `revalidatePath` after mutations.
- **Client components** (`"use client"`) hold the forms: `src/app/page.tsx`, `src/app/dashboard/page.tsx`, `src/components/edit-course-dialog.tsx`.
- **React Query** wraps the app via `src/app/providers.tsx` (`QueryClientProvider`). Server Actions are called directly from client components (no `useServerFn` wrapper). Keep `qc.invalidateQueries({ queryKey: ["courses"] })` after mutations.
- **Error / Not Found**: `src/app/error.tsx` (App Router `error.tsx` boundary) and `src/app/not-found.tsx`.
- **UI components** in `src/components/ui/` are shadcn/ui (new-york style, slate base, lucide icons). Add new ones via the shadcn CLI with `components.json` config.

## Key conventions

- Path alias: `@/*` → `./src/*`
- **Server Actions are the only server execution boundary** — never put DB access in a client component
- Tailwind 4 CSS-first config in `src/app/globals.css` with oklch colors and `@theme inline` — not a tailwind.config file
- shadcn utility: `cn()` from `@/lib/utils` (clsx + tailwind-merge)
- Prettier: 100 cols, double quotes, trailing commas, semicolons

## Gotchas

- `pnpm-workspace.yaml` exists only for `minimumReleaseAge: 0` (supply-chain policy relaxation) — this is NOT a monorepo
- `DATABASE_URL` env var required at runtime for all server actions (Vercel project env, or `.env.local` locally)
- `next build` does not need the DB; `next dev` hits Neon only on request
- `next-env.d.ts` is auto-generated — do not edit
- `@tanstack/react-query` and `@tanstack/react-table` are kept (client-side state/table), but `@tanstack/react-start` and `@tanstack/react-router` are gone
