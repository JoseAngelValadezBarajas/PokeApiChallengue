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
# Next.js standalone output - only requires .next and node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
EXPOSE 3000
CMD ["npm", "run", "start"]
