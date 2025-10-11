# Fluorite

An elegant, offline‑first Progressive Web App (PWA) video player. This container image serves the built static application using Caddy.

## Features

- Drag & Drop or file dialog to open a video
- Clean controls with auto‑hide and keyboard shortcuts
- Video info overlay (codec, bitrate, dimensions, etc.)
- PWA: installable, offline‑ready with a service worker
- Internationalization (currently English and French)
- Privacy‑friendly: no backend, no telemetry

## Docker Image

- Preconfigured Caddy server serving static files from /srv
- Hardened HTTP security headers
- No volumes or env vars required
- No TLS support (reverse proxy required for production use)
- Expose port 80 in the container

Pull and run the image:

```bash
docker pull ghcr.io/afcms/fluorite:master
docker run --rm -p 4173:80 ghcr.io/afcms/fluorite:master
# Open http://localhost:4173
```

Or build locally:

```bash
docker build -t fluorite:latest .
docker run --rm -p 4173:80 fluorite:latest
```
