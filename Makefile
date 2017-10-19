.env.list:
	echo "NEXUS_GHE_OAUTH_ID=<O-AUTH-ID>" >> .env.list
	echo "NEXUS_GHE_OAUTH_SECRET=<O-AUTH-SECRET>" >> .env.list
	echo "NEXUS_GITHUB_USER=<GITHUB-USERNAME>" >> .env.list
	echo "NEXUS_GITHUB_TOKEN=<GITHUB-ACCESS-TOKEN>" >> .env.list
	echo "NEXUS_GITHUB_ORG=<GITHUB-ORGANISATION>" >> .env.list
	echo "Please now set the environment variables in .env.list!\n"

.env.javac.list:
		echo "NEXUS_TOOL_CANONICAL_NAME=javac" >> .env.javac.list
		echo "NEXUS_ACCESS_TOKEN=foo" >> .env.javac.list
		echo "Change ACCESS_TOKEN before deploying to production in .env.javac.list!\n"


.env.rng.list:
	echo "NEXUS_TOOL_CANONICAL_NAME=rng" >> .env.rng.list
	echo "NEXUS_ACCESS_TOKEN=foo" >> .env.rng.list
	echo "Change ACCESS_TOKEN before deploying to production in .env.rng.list!\n"

.env.iotool.list:
	echo "NEXUS_TOOL_CANONICAL_NAME=iotool" >> .env.iotool.list
	echo "NEXUS_ACCESS_TOKEN=foo" >> .env.iotool.list
	echo "Change ACCESS_TOKEN before deploying to production in .env.iotool.list!\n"

.env.peerfeedback.list:
	echo "NEXUS_TOOL_CANONICAL_NAME=peerfeedback" >> .env.peerfeedback.list
	echo "NEXUS_ACCESS_TOKEN=foo" >> .env.peerfeedback.list
	echo "Change ACCESS_TOKEN before deploying to production in .env.peerfeedback.list!\n"

.env.conf.list:
	echo "NEXUS_TOOL_CANONICAL_NAME=conf" >> .env.conf.list
	echo "NEXUS_ACCESS_TOKEN=foo" >> .env.conf.list
	echo "Change ACCESS_TOKEN before deploying to production in .env.conf.list!\n"

init-env: .env.list .env.javac.list .env.rng.list .env.iotool.list .env.conf.list .env.peerfeedback.list
	echo "All .env files initialised. Please ensure you change ACCESS_TOKEN information etc. before running Nexus.\n"

build:
	docker-compose -f docker-compose.yml build

build-dev:
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml build

init-nexus:
	docker-compose run nexus init

init-nexus-js:
	docker-compose run nexus init-js

init-nexus-db:
	docker-compose run nexus init-db

run:
	docker-compose -f docker-compose.yml up -d

run-dev:
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

restart-nexus:
	docker-compose restart nexus

restart-javac:
	docker-compose restart javac-tool

restart-rng:
	docker-compose restart rng-tool

restart-io:
	docker-compose restart io-tool

restart-config:
	docker-compose restart config-tool

restart-db:
	docker-compose restart db

restart-mongodb:
	docker-compose restart mongodb

restart-sneakers:
	docker-compose restart sneakers

restart-rabbitmq:
	docker-compose restart rabbitmq

restart-syslog:
	docker-compose restart syslog

bash:
	docker-compose exec nexus bash

migrate-db:
	docker-compose run nexus rake db:migrate

stop:
	docker-compose down

restart:
	make stop
	make run

restart-dev:
	make stop
	make run-dev

debug:
	docker attach nexusdeployment_nexus_1
