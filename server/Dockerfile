# Shared image: `runtime` (bind-mount dev) and `test` (full tree for e2e).
# Used by repo root `docker-compose.yml` (profiles `dev` / `test`).
#
# Pin runtime to match local/tooling (see repo `.tool-versions`, `package.json` engines):
#   Node.js 22.22.2, npm 10.9.7 (bundled with official node image).
FROM node:22.22.2-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22.22.2-alpine AS runtime
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
EXPOSE 3000
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["start:dev"]

FROM runtime AS test
COPY . .
