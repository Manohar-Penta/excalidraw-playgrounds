FROM node:alpine

WORKDIR /usr/src/app
RUN npm install -g pnpm

COPY package*.json ./
COPY ./packages ./packages
COPY ./turbo.json ./turbo.json
COPY ./pnpm-lock.yaml ./pnpm-lock.yaml
COPY ./.npmrc ./.npmrc
COPY ./pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY ./apps/ws-backend ./apps/ws-backend

RUN pnpm install --frozen-lockfile
RUN pnpm run db:generate

RUN pnpm run build --filter=ws-backend

EXPOSE 8080

CMD ["pnpm", "run", "start", "--filter=ws-backend"]