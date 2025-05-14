FROM node:18-alpine AS deps
WORKDIR /app


COPY package*.json ./
RUN npm ci --only=production


FROM node:18-alpine AS runner
WORKDIR /app


COPY --from=deps /app/node_modules ./node_modules
COPY . .


ENV PORT=8000
EXPOSE 8000


CMD ["node", "src/index.js"]
