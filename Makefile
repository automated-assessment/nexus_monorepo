.env.list:
	@echo "NEXUS_GHE_OAUTH_ID=<O-AUTH-ID>" >> .env.list
	@echo "NEXUS_GHE_OAUTH_SECRET=<O-AUTH-SECRET>" >> .env.list
	@echo "NEXUS_GITHUB_USER=<GITHUB-USERNAME>" >> .env.list
	@echo "NEXUS_GITHUB_TOKEN=<GITHUB-ACCESS-TOKEN>" >> .env.list
	@echo "NEXUS_GITHUB_ORG=<GITHUB-ORGANISATION>" >> .env.list
	@echo "Please now set the environment variables in .env.list!\n"

.env.%.list:
	@echo "NEXUS_TOOL_CANONICAL_NAME=$*" >> $@
	@echo "NEXUS_ACCESS_TOKEN=foo" >> $@
	@echo "Change ACCESS_TOKEN before deploying to production in $@!\n"

.PHONY: init-env build build-dev init-nexus init-nexus-js init-nexus-db run run-dev restart-nexus restart-javac restart-rng restart-io restart-config restart-db restart-mongodb restart-sneakers restart-rabbitmq restart-syslog bash migrate-db stop restart restart-dev debug

init-env: .env.list .env.javac.list .env.rng.list .env.iotool.list .env.conf.list .env.peerfeedback.list
	@echo "All .env files initialised. Please ensure you change ACCESS_TOKEN information etc. before running Nexus.\n"

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
