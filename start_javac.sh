#!/bin/bash
export $(cat .env.list | xargs) && npm start
