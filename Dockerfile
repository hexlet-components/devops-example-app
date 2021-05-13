FROM node:15

WORKDIR /app

COPY . .

CMD ["npm", "run", "dev"]
