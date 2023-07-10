FROM node:20-slim

ENV PATH="$PATH:node_modules/.bin"

RUN apt-get update && apt-get install -y make

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

CMD ["bin/start.sh"]
