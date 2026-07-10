# vipa-cursos

Personal Vipassana course tracker — register your sits and services in one place.

Built with **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS 4**, **shadcn/ui**, **React Query**, and **Neon (PostgreSQL)**. Server-side data access is done with **Server Actions**; the database is **Neon** accessed through `@neondatabase/serverless`.

## Tech stack

| Concern       | Choice                                         |
| ------------- | ---------------------------------------------- |
| Framework     | Next.js 16 (App Router)                        |
| UI            | React 19, Tailwind CSS 4, shadcn/ui (new-york) |
| Data fetching | React Query (client cache) + Server Actions    |
| Database      | Neon Postgres via `@neondatabase/serverless`   |
| Package mgr   | pnpm 11                                        |
| Deploy        | Vercel                                         |

## Prerequisites

- **Node.js** >= 20.9 (Node 22 LTS recommended)
- **pnpm** 11 (`corepack enable` or `npm i -g pnpm@11`)
- A **Neon** project (free tier is fine)

## Getting started

```bash
pnpm install
```

Create a local env file and paste your Neon connection string:

```bash
# .env.local  (gitignored)
DATABASE_URL=postgresql://<user>:<password>@<host>/<db>?sslmode=require
```

Then:

```bash
pnpm dev      # http://localhost:3000
```

## Scripts

| Command       | Description                      |
| ------------- | -------------------------------- |
| `pnpm dev`    | Start the dev server (Turbopack) |
| `pnpm build`  | Production build                 |
| `pnpm start`  | Run the production server        |
| `pnpm lint`   | ESLint (flat config)             |
| `pnpm format` | Prettier `--write .`             |

## Database

The app expects a `vipassana_courses` table in Neon. There is **no migration file** — create it once in the Neon SQL editor (or via `psql`):

```sql
CREATE TABLE vipassana_courses (
  id          SERIAL PRIMARY KEY,
  start_date  TEXT NOT NULL,
  place       TEXT NOT NULL,
  teacher     TEXT,
  country     TEXT,
  mode        TEXT NOT NULL CHECK (mode IN ('sit', 'serve')),
  days        INTEGER NOT NULL,
  obs         TEXT,
  created_at  TIMESTAMP NOT NULL DEFAULT now()
);
```

`DATABASE_URL` is read at request time by the Server Actions in `src/app/actions/courses.ts`. The build itself does not need the database.

## Project structure

```
src/
  app/
    layout.tsx          # root layout, metadata, providers
    providers.tsx       # React Query client provider
    page.tsx            # "/"  — new course form + history
    dashboard/page.tsx  # "/dashboard" — sortable/filterable table
    actions/courses.ts  # Server Actions (create / list / update / delete)
    error.tsx           # App Router error boundary
    not-found.tsx       # 404
    globals.css         # Tailwind 4 + design tokens (oklch)
  components/
    ui/                 # shadcn/ui primitives
    edit-course-dialog.tsx
  lib/
    utils.ts            # cn() helper
```

## Conventions

- **Path alias**: `@/*` → `./src/*`
- **Server Actions** are the only server execution boundary — never query the DB from a client component
- After a mutation action, `revalidatePath` is called and the client `invalidateQueries(["courses"])` refetches
- Tailwind 4 is CSS-first (`@theme inline` + oklch tokens in `globals.css`) — no `tailwind.config` file
- `cn()` (clsx + tailwind-merge) for conditional classes

## Gotchas

- `pnpm-workspace.yaml` exists **only** for two pnpm 11 settings: `minimumReleaseAge: 0` (relaxes the supply-chain release-age guard) and `dangerouslyAllowAllBuilds: true` (lets `sharp`'s build script run so `pnpm build`/`pnpm dev` don't abort). This is **not** a monorepo.
- `.env.local` is gitignored via `*.local` — never commit the database URL.

## Deploy (Vercel)

1. Import the repo in Vercel.
2. Add the `DATABASE_URL` environment variable (Production / Preview / Development) with your Neon string.
3. Vercel detects Next.js automatically — `pnpm install` + `pnpm build` run on deploy.
