#!/bin/bash
set -e

if [ "$1" = 'start-rails' ]; then
	exec rails server -b 0.0.0.0
fi

if [ "$1" = 'start-sneakers' ]; then
	exec rake sneakers:work
fi

if [ "$1" = 'init-js' ]; then
	npm install --production --silent

	cd lib/web-ide
	npm install --production --silent
	cd ../..

	exec npm run build
fi

if [ "$1" = 'init-dirs' ]; then
	mkdir -p tmp/pids
	mkdir -p var/submissions/code
	mkdir -p var/submissions/uploads
	mkdir -p var/submissions/tmp
	exec echo "All directories created."
fi

if [ "$1" = 'init-db' ]; then
	exec bundle exec rake db:setup
fi

if [ "$1" = 'init' ]; then
        npm install --production --silent

        cd lib/web-ide
        npm install --production --silent
        cd ../..

        npm run build

        mkdir -p tmp/pids
        mkdir -p var/submissions/code
        mkdir -p var/submissions/uploads
        mkdir -p var/submissions/tmp

        exec bundle exec rake db:setup
fi

exec "$@"
