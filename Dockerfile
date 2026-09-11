# Multi-stage Dockerfile for Self-Hosted Pokémon GO Dex Tracker

# Stage 1: Build the Frontend (Client)
FROM node:22-alpine AS client-builder
WORKDIR /app/client

# Copy client dependencies definitions
COPY client/package*.json ./
RUN npm ci

# Copy compiled pokemon dataset and client source code
COPY data/ /app/data/
COPY client/ ./
RUN cp /app/data/pokemon-data.json ./src/data/pokemon-data.json
RUN npm run build

# Stage 2: Production Server
FROM node:22-alpine AS production
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000
ENV DATA_DIR=/app/data

# Install curl for Docker healthcheck
RUN apk add --no-cache curl

# Copy and install server dependencies
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev

# Copy server source code and seed data
COPY server/ ./server/
COPY data/ /app/data/

# Copy static frontend build from stage 1 into server public directory
COPY --from=client-builder /app/client/dist ./server/public

# Create data directory for persistent SQLite storage
RUN mkdir -p /app/data

# Expose web port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start production server
WORKDIR /app/server
CMD ["node", "src/server.js"]
