#!/bin/bash
set -e

if [ "$1" = 'start' ]; then
  chown -R app:app /home/app/submissions
  exec gosu app node .
fi

exec "$@"
