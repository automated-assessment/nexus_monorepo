# Check for dev mode: This will be determined by placing a file in the .build-mode directory
# Targets are defined below to make it easier to switch between modes
# By default, we're in development mode
ifeq ($(shell if [ ! -f .build-mode/.production ]; then echo "development"; else echo "production"; fi ),development)
	docker-compose-files := -f docker-compose.yml -f docker-compose.graders.yml -f docker-compose.dev.yml -f docker-compose.graders.dev.yml
	docker-compose-files-test := -f docker-compose.tests.yml -f docker-compose.graders.yml -f docker-compose.graders.dev.yml -f docker-compose.graders.tests.yml
	build-mode := development
else
	docker-compose-files := -f docker-compose.yml -f docker-compose.graders.yml
	docker-compose-files-test := -f docker-compose.tests.yml -f docker-compose.graders.yml -f docker-compose.graders.tests.yml
	build-mode := production
endif

# Switch to development mode
.build-mode/.development:
	@mkdir -p .build-mode
	@rm -rf .build-mode/.production
	@touch .build-mode/.development
	@echo "Now in development mode"

dev: .build-mode/.development

development: dev

# Switch to production mode
.build-mode/.production:
	@mkdir -p .build-mode
	@rm -rf .build-mode/.development
	@touch .build-mode/.production
	@echo "Now in production mode"

production: .build-mode/.production

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
	@echo "UAT_ACCESS_TOKEN=foo" >> $@
	@echo "Change ACCESS_TOKENs before deploying to production in $@!\n"

.env.uat.list:
	@echo "UAT_ACCESS_TOKEN=foo" >> .env.uat.list
	@echo "MYSQL_DATABASE=uat" >> .env.uat.list
	@echo "MYSQL_USER=uat-tool" >> .env.uat.list
	@echo "MYSQL_PASSWORD=uat-pass" >> .env.uat.list
	@echo "MYSQL_ROOT_PASSWORD=root" >> .env.uat.list
	@echo "MYSQL_ALLOW_EMPTY_PASSWORD=yes" >> .env.uat.list
	@echo "Change ACCESS_TOKEN and DB passwords before deploying to production in .env.uat.list!\n"

.PHONY: dev development production init-env build build-dev init-nexus init-nexus-js init-nexus-db run run-dev restart-nexus restart-javac restart-rng restart-io restart-config restart-db restart-mongodb restart-uat restart-sneakers restart-rabbitmq restart-syslog bash migrate-db stop restart restart-dev debug build-tests test-graders

init-env: .env.list .env.uat.list .env.javac.list .env.rng.list .env.iotool.list .env.conf.list .env.peerfeedback.list
	@echo "All .env files initialised. Please ensure you change ACCESS_TOKEN information etc. before running Nexus.\n"

build:
	@echo "Working in $(build-mode) mode."
	docker-compose $(docker-compose-files) build

init-nexus:
	@echo "Working in $(build-mode) mode."
	docker-compose $(docker-compose-files) run nexus init

init-nexus-js:
	@echo "Working in $(build-mode) mode."
	docker-compose $(docker-compose-files) run nexus init-js

init-nexus-db:
	@echo "Working in $(build-mode) mode."
	docker-compose $(docker-compose-files) run nexus init-db

run:
	@echo "Working in $(build-mode) mode."
	docker-compose $(docker-compose-files) up -d

restart-nexus:
	@echo "Working in $(build-mode) mode."
	docker-compose $(docker-compose-files) restart nexus

restart-javac:
	@echo "Working in $(build-mode) mode."
	docker-compose $(docker-compose-files) restart javac-tool

restart-rng:
	@echo "Working in $(build-mode) mode."
	docker-compose $(docker-compose-files) restart rng-tool

restart-io:
	@echo "Working in $(build-mode) mode."
	docker-compose $(docker-compose-files) restart io-tool

restart-config:
	@echo "Working in $(build-mode) mode."
	docker-compose $(docker-compose-files) restart config-tool

restart-db:
	@echo "Working in $(build-mode) mode."
	docker-compose $(docker-compose-files) restart db

restart-mongodb:
	@echo "Working in $(build-mode) mode."
	docker-compose $(docker-compose-files) restart mongodb

restart-uat:
	@echo "Working in $(build-mode) mode."
	docker-compose $(docker-compose-files) restart unique-assignment-tool

restart-sneakers:
	@echo "Working in $(build-mode) mode."
	docker-compose $(docker-compose-files) restart sneakers

restart-rabbitmq:
	@echo "Working in $(build-mode) mode."
	docker-compose $(docker-compose-files) restart rabbitmq

restart-syslog:
	@echo "Working in $(build-mode) mode."
	docker-compose $(docker-compose-files) restart syslog

bash:
	@echo "Working in $(build-mode) mode."
	docker-compose $(docker-compose-files) exec nexus bash

migrate-db:
	@echo "Working in $(build-mode) mode."
	docker-compose $(docker-compose-files) run nexus rake db:migrate

stop:
	@echo "Working in $(build-mode) mode."
	docker-compose $(docker-compose-files) down

restart:
	make stop
	make run

debug:
	@echo "Working in $(build-mode) mode."
	docker attach nexusdeployment_nexus_1

build-tests:
	@echo "Working in $(build-mode) mode."
	docker-compose $(docker-compose-files-test) build grader-tester

test-graders:
	@echo "Working in $(build-mode) mode."
	sudo rm -rf ./tests/repositories
	docker-compose $(docker-compose-files-test) up -d
	docker-compose $(docker-compose-files-test) exec -T grader-tester npm start
	docker-compose $(docker-compose-files-test) down

stop-tests:
	@echo "Working in $(build-mode) mode."
	docker-compose $(docker-compose-files-test) down
