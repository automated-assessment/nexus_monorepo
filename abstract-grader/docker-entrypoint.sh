#!/bin/bash
set -e

if [ "$1" = 'start' ]; then
  exec npm start
fi

exec "$@"
