#!/bin/bash

#npm install

set -e

if [ "$1" = 'start-cfg' ]; then
  exec node .
fi

exec "$@"
