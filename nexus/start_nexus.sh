#!/bin/bash
export $(cat .env.list | xargs) && rails s -b 0.0.0.0
