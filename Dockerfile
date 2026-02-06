FROM node:18-alpine AS base

# --- Dependencies stage ---
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# --- Build stage ---
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects telemetry by default — disable it during build
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# --- Production stage ---
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/public ./public

# Copy standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

# Railway injects PORT at runtime (defaults to 3000)
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

EXPOSE ${PORT}

CMD ["node", "server.js"]
