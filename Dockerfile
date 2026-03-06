FROM node:20-slim AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY tsconfig.json ./
COPY src/ ./src/
COPY query_ApiApplication.graphql ./

RUN npx tsc

FROM node:20-slim

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist
COPY query_ApiApplication.graphql ./

EXPOSE 3001

CMD ["node", "dist/server.js"]
