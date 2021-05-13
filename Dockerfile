FROM node:15

WORKDIR /app

RUN npm install -g npm@7.12.1

COPY . .
