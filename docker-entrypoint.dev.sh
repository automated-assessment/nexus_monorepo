#!/bin/bash
set -e

if [ "$1" = 'start' ]; then
	exec rails server -b 0.0.0.0
fi

exec "$@"
