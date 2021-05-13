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
