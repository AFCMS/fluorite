<img align="right" width="100" height="100" src="public/fluorite.svg">

# Fluorite

An elegant, offline‑first PWA video player for your local media. Try the [official version](https://fluorite.afcms.dev)!

[![Artifact Hub](https://img.shields.io/endpoint?style=for-the-badge&url=https://artifacthub.io/badge/repository/fluorite)](https://artifacthub.io/packages/container/fluorite/fluorite)
[![Deploy with Vercel](https://img.shields.io/badge/deploy-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FAFCMS%2Ffluorite&project-name=fluorite&repository-name=fluorite)

[![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev)
[![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)

## Features

- Drag & Drop or file dialog to open a video
- Clean controls with auto‑hide and keyboard shortcuts
- Video info overlay (codec, bitrate, dimensions, etc.)
- PWA: installable, offline‑ready with a service worker
- Internationalization (currently English and French)
- Privacy‑friendly: no server, no tracking; plays your local files in the browser

## Quick start (local)

This project requires pnpm.

```bash
corepack enable pnpm
pnpm install

# Development (http://localhost:5173)
pnpm run dev

# Production build + preview (http://localhost:4173)
pnpm run build && pnpm run preview
```

## Run with Docker

Prebuilt images are published to GitHub Container Registry.

Pull and run:

```bash
docker pull ghcr.io/afcms/fluorite:master
docker run --rm -p 4173:80 ghcr.io/afcms/fluorite:master
# Open http://localhost:4173
```

Build locally and run:

```bash
docker build -t fluorite:latest .
docker run --rm -p 4173:80 fluorite:latest
# Open http://localhost:4173
```

Docker details:

- Preconfigured Caddy server serving static files from /srv
- Hardened HTTP security headers
- No volumes or env vars required
- No TLS support (reverse proxy required for production use)

## Internationalization

Fluorite uses Lingui for i18n.

```bash
pnpm run extract    # extract source strings
# edit translations in src/locales/*/messages.po
pnpm run build
```

## Development

Scripts of interest:

- `pnpm run dev` — start dev server at http://localhost:5173
- `pnpm run build` — typecheck and build the app
- `pnpm run preview` — preview the production build at http://localhost:4173
- `pnpm run lint` — run ESLint
- `pnpm run test` — run unit tests (Vitest)
