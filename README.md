# WeSee Website

Marketing site for **WeSee** — an AI automation & engineering studio. Live at [weseegpt.com](https://www.weseegpt.com/).

## Tech stack

- **React 19** + **Vite 7** + **TypeScript** (strict)
- **Tailwind CSS v4** + **shadcn/ui** (Radix primitives)
- **wouter** for client-side routing
- **framer-motion** / **gsap** / **lenis** for motion
- **Resend** for the contact-form email (Vercel serverless function in `api/`)
- Deployed on **Vercel**

## Getting started

```bash
pnpm install
cp .env.example .env   # fill in RESEND_API_KEY etc.
pnpm dev               # http://localhost:3000
```

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the Vite dev server (with a dev `/api/contact` handler) |
| `pnpm build` | Production build (`dist/public`) |
| `pnpm preview` | Preview the production build |
| `pnpm check` | Type-check the project (`tsc --noEmit`) |
| `pnpm format` | Format with Prettier |

## Environment variables

See [`.env.example`](./.env.example). The contact form needs `RESEND_API_KEY`;
`CONTACT_TO`, `RESEND_FROM`, and the `VITE_WHATSAPP_*` widget vars are optional.

## Project layout

```
api/        Vercel serverless functions (contact form -> Resend)
client/     React SPA (src/) + static assets (public/) + landing pages
server/     Standalone Express server for self-hosting (not used by Vercel)
shared/     Code shared between client & server
```

## Deployment

Vercel builds with `vite build` (see `vercel.json`) and serves `api/` functions
automatically. Routing, redirects, and security headers are configured in
`vercel.json`.
