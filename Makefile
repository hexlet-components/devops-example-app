start:
	npm start

test:
	npm test -s

install:
	npm install

lint:
	npx eslint .

build:
	docker build . -t hexlet-components/devops-example-app

push:
	docker push hexlet-components/devops-example-app

bash:
	docker run -it -p 5000:5000 hexlet-components/devops-example-app bash

compose-install:
	docker-compose run application make install

compose-lint:
	docker-compose run application make lint

# FIXME: Починить тесты при запуске в контейнере
compose-test:
	docker-compose run application make test

compose-start:
	docker-compose up --abort-on-container-exit

compose-setup: compose-down compose-build compose-install

compose-build:
	docker-compose build

compose-down:
	docker-compose down || true

compose-stop:
	docker-compose stop || true

compose-restart:
	docker-compose restart

compose-bash:
	docker-compose application run bash
