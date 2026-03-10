FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

RUN apk add --no-cache netcat-openbsd wget

COPY . .

RUN node ace build

COPY docker/wait-for-db.sh /usr/local/bin/wait-for-db.sh
RUN chmod +x /usr/local/bin/wait-for-db.sh

EXPOSE 3333

CMD ["node", "bin/server.js"]
