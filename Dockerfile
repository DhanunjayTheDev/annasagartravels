FROM node:20-alpine AS base
WORKDIR /app

# Server
FROM base AS server-deps
COPY server/package.json server/package-lock.json* ./
RUN npm ci --omit=dev

FROM base AS server
COPY --from=server-deps /app/node_modules ./node_modules
COPY server/ ./
EXPOSE 5000
CMD ["node", "src/index.js"]

# Client build
FROM base AS client-build
COPY client/package.json client/package-lock.json* ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Admin build
FROM base AS admin-build
COPY admin/package.json admin/package-lock.json* ./
RUN npm ci
COPY admin/ ./
RUN npm run build
