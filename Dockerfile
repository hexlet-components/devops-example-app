FROM node:17-slim

RUN apt-get update && apt-get install -y make

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

CMD ["npm", "start"]
