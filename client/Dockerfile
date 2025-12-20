# ----------------------------------------
# Base image with Bun
# ----------------------------------------
FROM oven/bun:1 AS base
WORKDIR /app

# ----------------------------------------
# Dependencies layer (cached)
# Only package.json / lockfile copied first for efficient caching
# ----------------------------------------
FROM base AS deps
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile || bun install

# ----------------------------------------
# Build layer
# ----------------------------------------
FROM base AS builder
# Copy installed node_modules from deps layer
COPY --from=deps /app/node_modules ./node_modules

# Copy full source (after dependencies for maximum cache benefits)
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

RUN bun run build

# ----------------------------------------
# Production runtime
# ----------------------------------------
FROM oven/bun:1-slim AS runner
WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME="0.0.0.0" \
    NEXT_TELEMETRY_DISABLED=1

# Create lightweight user
RUN groupadd -g 1001 nodejs && \
    useradd -r -u 1001 -g nodejs nextjs

# Copy public assets
COPY --from=builder /app/public ./public

# Copy standalone Next.js server output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# Standalone server.js lives inside the standalone directory:
CMD ["bun", "server.js"]