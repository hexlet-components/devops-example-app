FROM node:24-bookworm
WORKDIR /app
RUN npm install --global pnpm@12.11.2
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY --chown=node:node . .
RUN pnpm run build
RUN chown node:node /app
ENV NODE_ENV=production
USER node
EXPOSE 3000
CMD ["node", "server.mjs"]
