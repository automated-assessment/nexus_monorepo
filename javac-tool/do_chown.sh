#!/bin/bash
shopt -s extglob dotglob globstar
shopt -p
cd /home/app/src
chown -R app:app !(node_modules)
