# Project context — Beemo

This repository contains the Beemo website built with the Next.js App Router. The prior La Plata Systems site is historical reference material only.

## Non-negotiables

- TypeScript only for application code.
- Next.js App Router.
- Tailwind CSS v4 for styling.
- Keep the landing page responsive and accessible.
- Prefer small feature-focused components over one very large page component.
- Keep the content model in `lib/content.ts` when adding or editing services, tabs, steps, clients, or form options.
- Do not move the quote form state into a global store unless a backend workflow requires it.
- Do not add a UI kit solely for simple buttons/cards/dialogs; the project currently uses local primitives and SVG icons.

## Main areas

- `components/sections/header.tsx` — sticky navigation + mobile menu entry point.
- `components/sections/hero.tsx` — hero and metrics.
- `components/sections/services.tsx` — service cards; detail modal is orchestrated by `landing-page.tsx`.
- `components/sections/about-section.tsx` — tabs for company information.
- `components/sections/process.tsx` — three-step methodology.
- `components/sections/quote-form.tsx` — three-step quote form and success state.
- `components/sections/chat-widget.tsx` — front-end demo assistant.
- `lib/content.ts` — typed content configuration.

## Backend integration point

`QuoteForm` is currently UI-only. When connecting a backend, keep the browser-side UX intact and add a Server Action or Route Handler rather than hard-coding a provider into the component.

<!-- markdownlint-disable MD025 -->
<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
<!-- markdownlint-enable MD025 -->
