# syntax=docker/dockerfile:1
# check=error=true

FROM --platform=$BUILDPLATFORM node:22-alpine AS builder

LABEL org.opencontainers.image.title="Fluorite"
LABEL org.opencontainers.image.description="An elegant PWA video player"
LABEL org.opencontainers.image.authors="AFCMS <afcm.contact@gmail.com>"
LABEL org.opencontainers.image.licenses="GPL-3.0-only"
LABEL org.opencontainers.image.source="https://github.com/AFCMS/fluorite"
LABEL io.artifacthub.package.logo-url="https://raw.githubusercontent.com/AFCMS/fluorite/refs/heads/master/public/fluorite.svg"
LABEL io.artifacthub.package.readme-url="https://raw.githubusercontent.com/AFCMS/fluorite/refs/heads/master/README.md"
LABEL io.artifacthub.package.category="skip-prediction"
LABEL io.artifacthub.package.keywords="video-player,offline,pwa"
LABEL io.artifacthub.package.license="GPL-3.0-only"
LABEL io.artifacthub.package.maintainers='[{"name":"AFCMS","email":"afcm.contact@gmail.com"}]'

RUN corepack enable pnpm

WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

RUN --mount=type=cache,id=pnpm,target="/pnpm/store" pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

FROM caddy:2-alpine

COPY --from=builder /app/dist /srv

COPY Caddyfile /etc/caddy/Caddyfile

EXPOSE 80

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]
