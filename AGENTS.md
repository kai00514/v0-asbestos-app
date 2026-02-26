# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

VizyAs (アスベスト判定アプリ) — a Japanese-language asbestos detection PWA built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, and shadcn/ui. External services: Supabase (auth/DB/storage), Stripe (billing), Roboflow (AI detection).

### Dev server

```bash
pnpm dev          # starts at http://localhost:3000
```

The root page (`/`) redirects to `/dashboard` (protected). Unauthenticated users are redirected to `/login`. Public pages: `/login`, `/signup`, `/forgot-password`, `/signup-success`.

### Build & lint

```bash
pnpm build        # Next.js production build (TS/ESLint errors ignored via next.config.mjs)
pnpm lint         # ESLint — NOTE: eslint is NOT in package.json dependencies; this script will fail unless eslint is installed separately
```

### Environment variables

A `.env.local` file is required with at minimum these keys (see code for usage):

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` / `STRIPE_WEBHOOK_SECRET`
- `ROBOFLOW_API_KEY` / `ROBOFLOW_WORKFLOW_URL`
- `NEXT_PUBLIC_SITE_URL` (defaults to `http://localhost:3000`)

Placeholder values allow the dev server to start and render pages. Auth/API features require real Supabase credentials.

### Key gotchas

- **No ESLint dependency**: `package.json` defines `"lint": "eslint ."` but ESLint is not listed in `dependencies` or `devDependencies`. Running `pnpm lint` will fail.
- **No automated tests**: There are no test files or test framework configured in this project.
- **v0.app generated**: This project was scaffolded by v0.app and auto-syncs to Vercel. The codebase may contain patterns specific to the v0 workflow.
- **`pnpm.onlyBuiltDependencies`**: Configured for `sharp` and `@tailwindcss/oxide` to avoid interactive build prompts during `pnpm install`.
