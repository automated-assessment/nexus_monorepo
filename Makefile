# Check whether including matlab grader: This will be determined by placing a file in the .build-mode directory
# Targets are defined below to make it easier to switch between modes
# By default, we're not including the grader
ifeq ($(shell if [ ! -f .build-mode/.include_matlab ]; then echo "no_matlab"; else echo "matlab"; fi ),matlab)
	docker-compose-matlab := -f docker-compose.matlab.yml -f docker-compose.matlab.nexus.yml
	matlab-mode := with Matlab
	test-files := /test-specs/matlab.yml
	docker-compose-tests-matlab := -f docker-compose.matlab.yml -f docker-compose.matlab.tests.yml
else
	docker-compose-matlab :=
	matlab-mode := without Matlab
	test-files :=
	docker-compose-tests-matlab :=
endif

# Check for dev mode: This will be determined by placing a file in the .build-mode directory
# Targets are defined below to make it easier to switch between modes
# By default, we're in development mode
ifeq ($(shell if [ ! -f .build-mode/.production ]; then echo "development"; else echo "production"; fi ),development)
	docker-compose-files := -f docker-compose.yml -f docker-compose.graders.yml $(docker-compose-matlab) -f docker-compose.dev.yml -f docker-compose.graders.dev.yml
	docker-compose-files-test := -f docker-compose.tests.yml -f docker-compose.graders.yml -f docker-compose.graders.dev.yml -f docker-compose.graders.tests.yml $(docker-compose-tests-matlab)
	build-mode := development
else
	docker-compose-files := -f docker-compose.yml -f docker-compose.graders.yml $(docker-compose-matlab)
	docker-compose-files-test := -f docker-compose.tests.yml -f docker-compose.graders.yml -f docker-compose.graders.tests.yml $(docker-compose-tests-matlab)
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

.build-mode/.include_matlab:
	@mkdir -p .build-mode
	@rm -rf .build-mode/.no_matlab
	@touch .build-mode/.include_matlab
	@echo "Now including matlab grader. Please make sure you have all environment vars set up and Matlab installed."

matlab: .build-mode/.include_matlab

.build-mode/.no_matlab:
	@mkdir -p .build-mode
	@rm -rf .build-mode/.include_matlab
	@touch .build-mode/.no_matlab
	@echo "No longer including matlab grader."

no-matlab: .build-mode/.no_matlab

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

.PHONY: dev development production init-env build build-dev init-nexus init-nexus-js init-nexus-db run run-dev restart-nexus restart-javac restart-rng restart-io restart-config restart-db restart-mongodb restart-uat restart-sneakers restart-rabbitmq restart-syslog bash migrate-db stop restart restart-dev debug build-tests test-graders stop-tests test-nexus ps matlab no-matlab

init-env: .env.list .env.uat.list .env.javac.list .env.rng.list .env.iotool.list .env.conf.list .env.peerfeedback.list .env.matlab.list
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

service := nexus
bash:
	@echo "Working in $(build-mode) mode."
	docker-compose $(docker-compose-files) exec $(service) bash

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
	@echo "Removing temporary files. Provide your sudo password when asked..."
	sudo rm -rf ./grader_tester/tests/repositories
	@echo "Spinning up test infrastructure. This may take a little while..."
	@docker-compose $(docker-compose-files-test) up -d > /dev/null 2>&1
	@echo "Running tests"
	@docker-compose $(docker-compose-files-test) exec grader-tester node test_runner.js ${test-files}; \
	test_exit=$$?; \
	echo "Shutting down test infrastructure. This may take a little while..."; \
	docker-compose $(docker-compose-files-test) down > /dev/null 2>&1 ; \
	exit $$test_exit

stop-tests:
	@echo "Working in $(build-mode) mode."
	docker-compose $(docker-compose-files-test) down

test-nexus:
	@echo "Working in $(build-mode) mode."
	@make run
	docker-compose $(docker-compose-files) exec nexus bash -c "RAILS_ENV=test bundle exec rspec"
	@make stop

ps:
	@echo "Working in $(build-mode) mode."
	docker-compose $(docker-compose-files) ps
