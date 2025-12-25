FROM oven/bun:1-alpine AS base

FROM base AS pruner
WORKDIR /usr/src/app
RUN bun install -g turbo@^2.7.2
COPY package.json bun.lock turbo.json ./
COPY apps/server/package.json ./apps/server/
COPY packages/*/package.json ./packages/*/
RUN bun install --frozen-lockfile
COPY . .
RUN turbo prune server

FROM base AS builder
WORKDIR /usr/src/app

COPY --from=pruner /usr/src/app/out/ .
RUN bun install --frozen-lockfile
RUN bun turbo build --filter=server

FROM base AS runner
WORKDIR /usr/src/app

ENV NODE_ENV=production \
    PORT=3001 \
    HOSTNAME="0.0.0.0"
COPY --from=builder /usr/src/app/apps/server/dist/ .

EXPOSE 3001
CMD ["bun", "./index.js"]


