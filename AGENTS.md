<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Agent Notes — Mundo CRM

Compact context for working in this repo. If a fact is obvious from filenames, it is not here.

---

## Stack & Versions

- Next.js **16.2.9** App Router, React **19.2.4**, Tailwind **v4** (`@tailwindcss/postcss`).
- Database: **PostgreSQL** via **Prisma** 6.19.3 + Supabase Auth / Storage.
- Auth helpers are in `lib/supabase/server.js`; the re-export facade is `lib/auth.js`.

## Dev Commands

| Command | What it does |
|---|---|
| `npm run dev` | Starts Next.js on `:3000` and opens **landing** (`/`) in the browser. |
| `npm run dev:dashboard` | Same but opens `/dashboard`. |
| `npm run build` | Production build. |
| `npm run seed` | Seeds companies, plans and sample leads into Postgres. |
| `npm test` | Runs Node native tests (`node --test`) under `tests/`. |
| `npm run lint` | ESLint via `eslint.config.mjs` (`eslint-config-next/core-web-vitals`). |
| `node scripts/apply-migration.js` | Applies the **custom** schema migration SQL. |
| `node scripts/setup-supabase.js` | Creates the public `assets` bucket and the admin user (`admin@mundo-crm.local` / `mundo2026`). |

## Local Auth Shortcuts

- **Dev login:** in `/dashboard/login`, use `admin` / `admin`. It sets a local cookie `mundo-local-auth=admin`; `getSession()` returns a fake admin session in `NODE_ENV=development`.
- **Demo mode:** set `DEMO_MODE=true` to bypass auth entirely.
- Admin check: email must match `ADMIN_EMAIL` (default `admin@mundo-crm.local`) **or** `user.user_metadata.role === "admin"`.

## Database & Migrations

- Schema source of truth: `prisma/schema.prisma`.
- **Do not rely only on `npx prisma migrate deploy`** — there are no Prisma migration files for the existing tables. Use `node scripts/apply-migration.js` to run the idempotent raw-SQL migration script.
- After schema changes: update `prisma/schema.prisma` **and** `scripts/apply-migration.js`, then run the migration script, then `npx prisma generate`.
- `DIRECT_URL` must point to the Supabase direct connection (`db.*.supabase.co:5432`, no `pgbouncer`). `DATABASE_URL` can be the pooler (`*.pooler.supabase.com:6543`) for runtime.
- `SellerPlanOverride` stores `sellerId`/`planId` as `TEXT` while Prisma models use UUID strings; the migration creates **indexes only**, no FK constraints, to avoid type mismatches.

## App Architecture

- Landing page: `app/p/[slug]/page.js` (client component). Fetches `/api/sellers?slug=...` and `/api/plans?companySlug=...`, merges overrides with `getMergedPlans()` from `lib/landing.js`.
- Dashboard entry: `app/dashboard/page.js` (server component). Calls `requireAuth()`, auto-creates a `Seller` for non-admins via `findOrCreateSellerForUser()`, and passes initial data to `DashboardClient.jsx`.
- `DashboardClient.jsx` reads `?tab=` query param and maps it to `activeMenu`. Navigation item `"landing"` renders `components/dashboard/features/LandingEditor.jsx`.
- Shared landing defaults & merge helpers live in `lib/landing.js`.

## Landing Editor Preview

- The preview renders the landing components **inline** as React children, not in an iframe.
- Reason: `next.config.mjs` sends `X-Frame-Options: DENY` and a CSP with `frame-src 'none'`.
- To keep labels/names correct in the preview, `useLandingEditor` initializes the global `SELLER_CONFIG` via `updateSellerConfig()` after loading the seller.
- Inactive plans are filtered in the preview with `plans.filter(p => p.sellerActive !== false)`.

## Security / Headers

- `next.config.mjs` defines `Content-Security-Policy`, `HSTS`, `X-Frame-Options`, etc. If you need to embed anything in an iframe or load external scripts/styles, update both the headers and the `images.remotePatterns` list.
- Rate limiting is in `lib/rate-limit.js`; it works locally without Redis but needs `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` to be global in production.

## Build Gotchas

- On Windows + OneDrive, `npm run build` can fail with `EPERM` while deleting `.next/`. Kill Node processes (`taskkill /F /IM node.exe`), remove `.next`, and retry.
- `postinstall` runs `prisma generate`, but after killing Node or editing the schema you may need to run `npx prisma generate` manually before the build sees new fields.

## Tests

- Tests use Node’s built-in test runner (`node --test`).
- No DB setup required for the current suites; they test pure utilities (`lib/seller.js`, `lib/rate-limit.js`, etc.).
