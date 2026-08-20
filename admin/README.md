# Mind Substances Admin CMS

Secure editorial admin for the static Mind Substances GitHub Pages site.

## Architecture

- Public site: GitHub Pages from branch `github-pages-clean`
- Admin app: Next.js app in `/admin`, deploy separately (recommended: Vercel)
- Authentication: Clerk
- Authorization: `ADMIN_EMAILS` allow-list
- Content source: `content/posts.json` on `github-pages-clean`
- Publishing: GitHub Contents API; each write to `github-pages-clean` triggers the existing Pages workflow

## Moderation workflow

`draft -> pending_review -> published`

Additional states: `rejected`, `archived`.

Allowed transitions are enforced server-side. The public frontend renders only `published` records.

## Required environment variables

See `.env.example`.

For Vercel, set the project root directory to `admin` and configure:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`
- `ADMIN_EMAILS` (comma-separated)
- `GITHUB_TOKEN` (server-only token with Contents read/write access to this repository)
- `GITHUB_OWNER=lexographixplus`
- `GITHUB_REPO=bejanko`
- `GITHUB_BRANCH=github-pages-clean`

Never expose `GITHUB_TOKEN` to the browser.

## Current content types

- Essay
- Note
- Quote
- Book

Contests are intentionally excluded from the schema and admin UI.

## MVP capabilities

- Sign in
- Admin allow-list enforcement
- View editorial queue
- Create content
- Edit content
- Save draft
- Submit for review
- Publish
- Reject
- Archive and restore
- Featured and Start Here controls
- Cover image URL and reading-time metadata
- Safe plain-text-to-HTML conversion before publishing

## Next enhancements

- Role separation (writer/editor/admin)
- Rich text editor
- Cloudinary media picker/upload
- Revision history and diff view
- Preview URLs before publication
- Scheduled publishing
- Search/filtering
- Audit log UI
