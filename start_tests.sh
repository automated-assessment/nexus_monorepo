#!/bin/bash
export $(cat .env.test.list | xargs) && rspec
