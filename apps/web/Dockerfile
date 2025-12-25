FROM oven/bun:1-alpine AS base

FROM base AS pruner
WORKDIR /usr/src/app
RUN bun install -g turbo@^2.7.2
COPY . .
RUN turbo prune web

FROM base AS builder
WORKDIR /usr/src/app

COPY --from=pruner /usr/src/app/out/ .
RUN bun install --frozen-lockfile
RUN bun turbo build --filter=web

FROM base AS runner
WORKDIR /usr/src/app

ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME="0.0.0.0"
COPY --from=builder /usr/src/app/apps/web/dist/ .

EXPOSE 3000
CMD ["bun", "./server/server.js"]


