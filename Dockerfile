FROM node:14.17.0-alpine3.12

RUN apk add --no-cache bash make

WORKDIR /app

COPY . .

CMD ["npm", "start"]
