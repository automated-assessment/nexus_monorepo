init-sub-repos:
	git submodule init
	git submodule update

init-env:
	touch .env.list
	echo "NEXUS_GHE_OAUTH_ID=<O-AUTH-ID>" >> .env.list
	echo "NEXUS_GHE_OAUTH_SECRET=<O-AUTH-SECRET>" >> .env.list
	echo "NEXUS_GITHUB_USER=<GITHUB-USERNAME>" >> .env.list
	echo "NEXUS_GITHUB_TOKEN=<GITHUB-ACCESS-TOKEN>" >> .env.list
	echo "NEXUS_GITHUB_ORG=<GITHUB-ORGANISATION>" >> .env.list
	echo "Please now set the environment variables in .env.list!\n"

init-env-javac:
	touch .env.javac.list
	echo "NEXUS_TOOL_CANONICAL_NAME=javac" >> .env.javac.list
	echo "NEXUS_ACCESS_TOKEN=foo" >> .env.javac.list
	echo "Change ACCESS_TOKEN before deploying to production in .env.javac.list!\n"

init-env-rng:
	touch .env.rng.list
	echo "NEXUS_TOOL_CANONICAL_NAME=rng" >> .env.rng.list
	echo "NEXUS_ACCESS_TOKEN=foo" >> .env.rng.list
	echo "Change ACCESS_TOKEN before deploying to production in .env.rng.list!\n"

init-env-iotool:
	touch .env.iotool.list
	echo "NEXUS_TOOL_CANONICAL_NAME=iotool" >> .env.iotool.list
	echo "NEXUS_ACCESS_TOKEN=foo" >> .env.iotool.list
	echo "Change ACCESS_TOKEN before deploying to production in .env.iotool.list!\n"

init-env-conf:
	touch .env.conf.list
	echo "NEXUS_TOOL_CANONICAL_NAME=conf" >> .env.conf.list
	echo "NEXUS_ACCESS_TOKEN=foo" >> .env.conf.list
	echo "Change ACCESS_TOKEN before deploying to production in .env.conf.list!\n"

init-env-all:
	make init-sub-repos
	make init-env
	make init-env-javac
	make init-env-rng
	make init-env-iotool
	make init-env-conf

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
	docker restart nexusdeployment_nexus_1

restart-javac:
	docker restart nexusdeployment_javac-tool_1

restart-rng:
	docker restart nexusdeployment_rng-tool_1

restart-io:
	docker restart nexusdeployment_io-tool_1

restart-config:
	docker restart nexusdeployment_config-tool_1

restart-db:
	docker restart nexusdeployment_db_1

restart-mongodb:
	docker restart nexusdeployment_mongodb_1

restart-sneakers:
	docker restart nexusdeployment_sneakers_1

restart-rabbitmq:
	docker restart nexusdeployment_rabbitmq_1

restart-syslog:
	docker restart nexusdeployment_syslog_1

bash:
	docker exec nexusdeployment_nexus_1 bash

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
