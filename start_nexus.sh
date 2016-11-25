#!/bin/bash
export $(cat .env.list | xargs) && npm build && rails s -b 0.0.0.0
