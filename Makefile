compose-setup: env-prepare compose-build compose-install

compose-build:
	docker-compose build

compose-install:
	docker-compose run app make install

compose-bash:
	docker compose run app bash

compose-lint:
	docker-compose run app make lint

compose-lint-ci:
	docker-compose -f docker-compose.yml run app make lint

compose-test:
	docker-compose run app make test

compose-test-ci:
	docker-compose -f docker-compose.yml run app make test

compose-console:
	docker-compose run --rm app bash

compose:
	docker-compose up --abort-on-container-exit

compose-down:
	docker-compose down -v --remove-orphans

docker-push:
	docker-compose -f docker-compose.yml build
	docker-compose -f docker-compose.yml push app

setup: env-prepare install

install:
	npm ci

start:
	npm start

lint:
	npx eslint .

lint-fix:
	npx eslint . --fix


test:
	npm test

env-prepare:
	cp -n .env.example .env || true

deploy:
	ansible-playbook ansible/release.yml -i inventory.ini --extra-vars "version=$V"

ssh:
	ssh root@`yq e '.all.children.webservers.hosts.web1.ansible_host' ansible/inventory.yml`

# Для запуска x86-образа на ARM (например, Mac M1/M2):
# docker run --platform linux/amd64 -p 3000:3000 -e SERVER_MESSAGE="Hexlet Awesome Server" hexletcomponents/devops-example-app

multiarch-build-app:
	docker buildx build --platform linux/amd64,linux/arm64 -t hexletcomponents/devops-example-app .

multiarch-build-caddy:
	docker buildx build --platform linux/amd64,linux/arm64 -t hexletcomponents/devops-example-caddy -f services/caddy/Dockerfile .

multiarch-push-app:
	docker buildx build --platform linux/amd64,linux/arm64 -t hexletcomponents/devops-example-app --push .

multiarch-push-caddy:
	docker buildx build --platform linux/amd64,linux/arm64 -t hexletcomponents/devops-example-caddy -f services/caddy/Dockerfile --push .
