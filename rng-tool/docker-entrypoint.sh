#!/bin/bash

#npm install

set -e

if [ "$1" = 'start-rng' ]; then
  exec node index.js
fi

exec "$@"
