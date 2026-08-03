# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint
npx prisma generate  # Regenerate Prisma client after schema changes
npx prisma migrate dev --name <name>  # Create and apply a migration
npx prisma db seed   # Seed database (runs prisma/seed.ts via tsx)
```

Prisma 7 uses `prisma.config.ts` **at the repo root** for datasource config (it loads `.env` via dotenv). Prisma does not auto-discover this file under `prisma/`, so it must stay at the root. The Neon serverless adapter (`PrismaNeon`) is used in the app runtime (`src/lib/db.ts`).

## Architecture

**Next.js 16 + React 19** personal literary website for B.E. Janko Jnr. PostgreSQL (Neon) via Prisma 7. Tailwind CSS 4.

### Route groups

- `src/app/(public)/` — Public-facing pages (essays, notes, quotes, books, contests, about, contact, login). Uses shared Header + Footer layout.
- `src/app/(admin)/dashboard/` — Admin CMS behind auth. Protected by session check in layout; middleware gates `/dashboard/*` routes. Has sidebar nav.
- `src/app/page.tsx` — Homepage sits outside both groups (has its own Header/Footer).
- `src/app/api/` — REST-style API routes for CRUD and public actions (voting, submissions, uploads).

### Auth

NextAuth v5 (beta) with credentials provider only. JWT sessions. PrismaAdapter. Users have `ADMIN` or `EDITOR` roles stored in JWT. Login page at `/login`. Next.js 16 renamed middleware to proxy: `src/proxy.ts` re-exports `auth` as `proxy` to gate `/dashboard/*`.

### Data layer

- **Prisma schema** (`prisma/schema.prisma`): Auth models (User, Account, Session) + content models (Essay, Note, Quote, Book, GuestPost, AuthorProfile) + contest system (Contest, ContestEntry, Vote) + messaging (Submission) + newsletter (Subscriber) + SiteSetting KV store.
- **Server actions** (`src/lib/actions/`): One file per content type. These are the primary data-mutation layer used by admin forms.
- **`src/lib/db.ts`**: Singleton Prisma client with Neon adapter. Cached on `globalThis` in dev.

### Key patterns

- **Path alias**: `@/*` maps to `./src/*`
- **Fonts**: Three Google Fonts exposed as CSS variables — `--font-reading` (EB Garamond), `--font-ui` (Archivo), `--font-display` (Bricolage Grotesque)
- **Theming**: `next-themes` with custom semantic color tokens (`bg-paper`, `text-ink`, `bg-surface`, `border-rule`)
- **Rich text**: TipTap editor for content authoring in admin
- **Image uploads**: Cloudinary via `next-cloudinary`, using **signed** uploads — no unsigned preset needed. `/api/upload` signs for logged-in admins; `/api/upload/contest` is public but pinned to one folder and rate limited. Signatures must cover exactly the params the browser sends, so those routes validate `folder` rather than injecting it.
- **Email**: Resend via `src/lib/email.ts`. All sends are best-effort — a mail failure never rolls back the write that triggered it. Templates are inline-styled (mail clients ignore `<style>` and CSS variables).
- **Rate limiting**: `src/lib/rate-limit.ts` — in-memory, per-instance. A spam speed-bump, not a security boundary.
- **Slugs**: always allocate through `uniqueSlug()` in `src/lib/slug.ts`; every slug column is `@unique` and raw `slugify` collides on duplicate titles.
- **Headings/TOC**: TipTap emits no heading ids. `buildToc()` injects them server-side and returns the matching TOC — render `html` from it, not the raw content.
- **No `loading.tsx` in `(public)`**: a loading boundary flushes the shell before `notFound()` runs, turning every 404 into a soft 200.
- **Contest stages**: `src/lib/contest-stage.ts` derives the current stage (OPEN → SUBMITTING → REVIEW → VOTING → CLOSED) from date fields, with a `pinnedStage` override
- **Votes**: Email-confirmed via unique token; one vote per email per contest. `POST /api/vote` creates a PENDING vote and emails the link; `/vote/confirm` confirms it. Only CONFIRMED votes are counted.
- **Newsletter**: double opt-in — `POST /api/newsletter` then `/newsletter/confirm`. Existing addresses always get an `ok` response so the endpoint can't be used to probe for subscribers.
- **Search**: `/api/search` spans published content; `⌘K` / `/` opens the palette in the header.
