FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm

COPY . .

RUN pnpm install

RUN pnpm --filter api build

EXPOSE 3001

CMD ["sh", "-c", "pnpm prisma migrate deploy --schema=apps/api/prisma/schema.prisma && pnpm --filter api start:prod"]