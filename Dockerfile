FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json ./package.json
COPY yarn.lock ./yarn.lock

RUN yarn install --silent
COPY . .
RUN \
  yarn build && \
  rm -rf node_modules && \
  yarn install --production --silent

FROM node:18-alpine
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

COPY ./tools/deploy-commands.js ./tools/deploy-commands.js

COPY ./start.sh ./package.json ./
RUN chmod +x start.sh
CMD ./start.sh
