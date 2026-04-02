# frontend/Dockerfile
FROM node:20-alpine

WORKDIR /app

RUN corepack enable

# Install deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build app
RUN pnpm build

# Expose port (Railway uses $PORT)
EXPOSE 3000

# Start production server
CMD ["sh", "-c", "pnpm start -p ${PORT:-3000}"]