#!/bin/bash
export $(cat .env.javac.list | xargs) && npm start
