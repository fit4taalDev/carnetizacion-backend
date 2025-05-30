FROM node:18-alpine

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN npm ci --production

COPY . .

ENV PORT=8000
EXPOSE 8000


CMD ["node", "src/index.js"]
