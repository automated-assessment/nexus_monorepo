#!/bin/bash
set -e

if [ "$1" = 'start' ]; then
	exec gosu app node .
fi

exec "$@"
