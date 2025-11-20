# Stage 1: Building the application
FROM node:20-alpine AS builder

# Install build dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    ffmpeg

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./
COPY ./prisma ./prisma

# Install ALL dependencies (needed for build)
RUN yarn install --frozen-lockfile --ignore-engines

# Copy source code
COPY ./tsconfig.json ./tsconfig.json
COPY ./sources ./sources

# Build the application
RUN yarn build

# Stage 2: Production dependencies
FROM node:20-alpine AS deps

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./
COPY ./prisma ./prisma

# Install ONLY production dependencies
RUN yarn install --frozen-lockfile --production --ignore-engines && \
    yarn cache clean

# Stage 3: Runtime with glibc support
FROM frolvlad/alpine-glibc:alpine-3.19_glibc-2.34 AS runner

# Install Node.js, Yarn and runtime dependencies
RUN apk add --no-cache \
    nodejs \
    yarn \
    python3 \
    ffmpeg && \
    rm -rf /var/cache/apk/*

WORKDIR /app

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

# Set environment to production
ENV NODE_ENV=production

# Copy necessary files from builder
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/sources ./sources
COPY --from=builder /app/prisma ./prisma
COPY --from=deps /app/node_modules ./node_modules


# Switch to non-root user
USER nodejs

# Expose the port
EXPOSE 3005

# Command to run the application
CMD ["yarn", "start"]
# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3005/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1