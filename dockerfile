FROM oven/bun:1.2.9-alpine

WORKDIR /app

COPY ./package.json ./package.json
COPY ./bun.lock ./bun.lock

RUN bun install

COPY . .

EXPOSE 3000

CMD [ "bun", "index.ts" ]