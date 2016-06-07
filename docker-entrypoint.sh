#!/bin/bash
set -e

if [ "$1" = 'start' ]; then
	exec gosu app npm "$@"
fi

exec "$@"
