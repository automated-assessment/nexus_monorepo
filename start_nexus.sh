#!/bin/bash
export $(cat .env.file | xargs) && rails s -b 0.0.0.0
