#!/bin/bash
set -e

if [ "$1" = 'start' ]; then
	# Start sneakers workers, expecting daemonize: true to be part of the production configuration
	gosu app rake sneakers:work

	# Run the rails server
	exec gosu app rails server -b 0.0.0.0
fi

exec "$@"
