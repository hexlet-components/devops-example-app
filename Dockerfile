FROM node:26-slim

ENV PATH="$PATH:node_modules/.bin"

# make нужен, потому что команды приложения живут в Makefile.
RUN apt-get update && apt-get install -y --no-install-recommends make \
  && rm -rf /var/lib/apt/lists/*

# corepack из образов Node 26 убран, поэтому pnpm ставится напрямую. Версия
# берётся из поля packageManager, чтобы образ и разработка совпадали.
RUN npm install -g pnpm@11.20.0

WORKDIR /app

# Зависимости ставятся до копирования кода, чтобы слой с ними переиспользовался
# и не пересобирался на каждую правку исходников.
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# Стили собираются на сборке образа: собранный css в гит не едет, а без него
# приложение отдавало бы страницы без оформления.
RUN pnpm run build

# Запуск через скрипт, а не через `pnpm start`: приложение слушает 3000, и на
# этот порт рассчитаны уроки курса docker_basics_course.
CMD ["bin/start.sh"]
