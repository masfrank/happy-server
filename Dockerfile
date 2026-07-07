# Stage 1: install production dependencies
FROM node:20-alpine AS deps

RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    ffmpeg \
    openssl

WORKDIR /app

COPY package.json yarn.lock ./
COPY vendor ./vendor
COPY prisma ./prisma

RUN yarn install --production --ignore-engines && \
    yarn cache clean

# Stage 2: runtime with glibc support for native modules
FROM frolvlad/alpine-glibc:alpine-3.22_glibc-2.42 AS runner

RUN apk add --no-cache \
    nodejs \
    yarn \
    python3 \
    ffmpeg \
    openssl \
    wget && \
    rm -rf /var/cache/apk/*

WORKDIR /app

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    mkdir -p /data && \
    chown -R nodejs:nodejs /app /data

ENV NODE_ENV=production \
    DATA_DIR=/data \
    DB_PROVIDER=pglite \
    PORT=3005

COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./package.json
COPY index.cjs ./index.cjs
COPY bin ./bin
COPY prisma ./prisma
COPY sources ./sources
COPY tsconfig.json ./tsconfig.json

USER nodejs

EXPOSE 3005

CMD ["sh", "-c", "node node_modules/tsx/dist/cli.mjs sources/standalone.ts migrate && node node_modules/tsx/dist/cli.mjs sources/standalone.ts serve"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
    CMD wget -q -O /dev/null http://localhost:3005/health || exit 1
