FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./

FROM base AS deps
RUN npm install

FROM deps AS build
COPY . .
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
EXPOSE 4000
CMD ["node", "dist/main.js"]
