#!/bin/bash
set -e

if [ "$1" = 'start-rails' ]; then
	exec rails server -b 0.0.0.0
fi

if [ "$1" = 'start-sneakers' ]; then
	exec rake sneakers:work
fi

if [ "$1" = 'init' ]; then
	npm install --production --silent

	cd lib/web-ide
	npm install --production --silent
	cd ../..

	mkdir -p tmp/pids
	mkdir -p var/submissions/code
	mkdir -p var/submissions/uploads
	mkdir -p var/submissions/tmp

	npm run build
	exec bundle exec rake db:setup
fi

exec "$@"
