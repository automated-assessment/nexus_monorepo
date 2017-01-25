#!/bin/bash
docker-compose exec db pg_dump -U postgres nexus | gzip > dbdump.`date +%Y-%m-%d"_"%H_%M_%S`.sql.gz
