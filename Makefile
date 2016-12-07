init-files:
	git submodule init
	git submodule update

	touch .env.list
	echo "NEXUS_GHE_OAUTH_ID=<O-AUTH-ID>" >> .env.list
	echo "NEXUS_GHE_OAUTH_SECRET=<O-AUTH-SECRET>" >> .env.list
	echo "NEXUS_GITHUB_USER=<GITHUB-USERNAME>" >> .env.list
	echo "NEXUS_GITHUB_TOKEN=<GITHUB-ACCESS-TOKEN>" >> .env.list
	echo "NEXUS_GITHUB_ORG=<GITHUB-ORGANISATION>" >> .env.list

	touch .env.javac.list
	echo "NEXUS_TOOL_CANONICAL_NAME=javac" >> .env.javac.list
	echo "NEXUS_ACCESS_TOKEN=foo" >> .env.javac.list

	touch .env.rng.list
	echo "NEXUS_TOOL_CANONICAL_NAME=rng" >> .env.rng.list
	echo "NEXUS_ACCESS_TOKEN=foo" >> .env.rng.list

	touch .env.iotool.list
	echo "NEXUS_TOOL_CANONICAL_NAME=iotool" >> .env.iotool.list
	echo "NEXUS_ACCESS_TOKEN=foo" >> .env.iotool.list

	touch .env.conf.list
	echo "NEXUS_TOOL_CANONICAL_NAME=conf" >> .env.conf.list
	echo "NEXUS_ACCESS_TOKEN=foo" >> .env.conf.list

build:
	docker-compose -f docker-compose.yml build

build-dev:
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml build

run:
	docker-compose -f docker-compose.yml up -d

run-dev:
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

debug:
	docker attach nexus_deployment_nexus_1
