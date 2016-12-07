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
