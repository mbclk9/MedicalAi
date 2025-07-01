# TıpScribe Production Dockerfile
FROM node:20-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    git \
    curl \
    && rm -rf /var/cache/apk/*

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./
COPY tailwind.config.ts ./
COPY postcss.config.js ./
COPY drizzle.config.ts ./

# Install dependencies
RUN npm ci --only=production

# Copy application source
COPY client/ ./client/
COPY server/ ./server/
COPY shared/ ./shared/

# Build frontend
FROM base AS frontend-builder
RUN npm run build:client

# Build backend
FROM base AS backend-builder
RUN npm run build:server

# Production stage
FROM node:20-alpine AS production

# Create app user
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

WORKDIR /app

# Copy package files and install production dependencies only
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built application
COPY --from=frontend-builder --chown=appuser:appgroup /app/dist ./dist
COPY --from=backend-builder --chown=appuser:appgroup /app/dist ./server-dist
COPY --chown=appuser:appgroup server/ ./server/
COPY --chown=appuser:appgroup shared/ ./shared/

# Create uploads directory
RUN mkdir -p uploads && chown appuser:appgroup uploads

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/api/health || exit 1

# Start application
CMD ["npm", "start"]