#!/bin/bash
set -e

if [ "$1" = 'start' ]; then
  exec npm run-script start
fi

if [ "$1" = 'start-dev' ]; then
  exec npm run-script startdev
fi

exec "$@"
