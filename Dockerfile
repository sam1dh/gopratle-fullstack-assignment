FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@12 --activate

# --- deps ---
FROM base AS deps
WORKDIR /app
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/contracts/package.json ./packages/contracts/
COPY apps/api/package.json ./apps/api/
RUN pnpm install --frozen-lockfile

# --- build ---
FROM deps AS build
COPY tsconfig.json ./
COPY packages/contracts/ ./packages/contracts/
COPY apps/api/ ./apps/api/
RUN pnpm --filter @gopratle/contracts build
RUN pnpm --filter @gopratle/api build

# --- production ---
FROM node:22-alpine AS production
RUN corepack enable && corepack prepare pnpm@12 --activate
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/package.json ./apps/api/
COPY --from=build /app/packages/contracts/dist ./packages/contracts/dist
COPY --from=build /app/packages/contracts/src ./packages/contracts/src
COPY --from=build /app/packages/contracts/package.json ./packages/contracts/

# Patch contracts package.json to point to dist (production)
RUN sed -i 's|"./src/index.ts"|"./dist/index.js"|g' packages/contracts/package.json

WORKDIR /app/apps/api
ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "dist/server.js"]
