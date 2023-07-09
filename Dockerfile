FROM node:20-slim

RUN apt-get update && apt-get install -y make

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

CMD ["bin/start.sh"]
