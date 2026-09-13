FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++

RUN npm install -g pnpm

COPY . .

RUN pnpm install --dangerously-allow-all-builds

RUN pnpm --filter api build

EXPOSE 3001

CMD ["sh", "-c", "pnpm --filter api exec prisma db push --schema=./prisma/schema.prisma && pnpm --filter api run start:prod"]