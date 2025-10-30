# Development Stage
FROM node:20-alpine AS development

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install


COPY . .
EXPOSE 3000

# Jalankan NestJS dengan hot-reload
CMD ["npm", "run", "start:dev"]

# ---------- PRODUCTION STAGE ----------
FROM node:20-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production Stage
FROM node:20-alpine AS production

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/dist ./dist
COPY package*.json ./
RUN npm ci --omit=dev

EXPOSE 3000

CMD ["node", "dist/main.js"]
