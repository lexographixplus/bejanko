# Mind Substances — Admin/CMS Integration Contract

The public site is hosted on GitHub Pages and remains static. Content management is intentionally decoupled from the frontend.

## Content workflow

Admin users create or edit records in the CMS. Each record uses one moderation status:

- `draft`
- `pending_review`
- `published`
- `rejected`
- `archived`

Only `published` records are rendered publicly.

## Content source

Current public data lives in `content/posts.json` and `content/settings.json`. A future admin panel may either:

1. Write these JSON files through the GitHub API and trigger a Pages deployment, or
2. Replace the local adapter with a remote CMS/API endpoint while keeping the same response shape.

## Required post fields

`id`, `slug`, `type`, `title`, `excerpt`, `status`, `author`, `publishedAt`, `readingMinutes`, `coverImage`, `featured`, `startHere`, `bodyHtml`.

Supported content types for v1: `essay`, `note`, `quote`, `book`.

Contests are deliberately unsupported and must not be reintroduced into this schema.

## Moderation rules

The admin panel should require a review action before moving `pending_review` to `published`. It should record reviewer identity and timestamps in its own audit log. The public JSON should contain only fields safe to expose to readers.

## Security boundary

Never place admin credentials, GitHub tokens, API secrets, reviewer notes, private drafts, or moderation metadata in the GitHub Pages bundle. Authentication and write operations belong in the external admin service.

## Publishing model

Recommended v1 architecture:

Admin Panel → authenticated backend/API → GitHub Contents API → `content/*.json` → GitHub Actions → GitHub Pages.

This keeps the reading site fast and static while allowing full post creation, editing, review, moderation, scheduling, and publishing from the admin panel.