FROM node:22-slim AS base

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

RUN npx prisma generate && npm run build

EXPOSE 3000

CMD ["sh", "-c", "npx prisma db push && npm start"]
