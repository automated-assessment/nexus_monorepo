#!/bin/bash
/usr/local/bin/docker-compose exec db pg_dump -U postgres nexus | /usr/bin/gzip > dbdumps/dbdump.`/usr/bin/date +%Y-%m-%d"_"%H_%M_%S`.sql.gz
