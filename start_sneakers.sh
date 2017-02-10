#!/bin/bash
export $(cat .env.list | xargs) && rake sneakers:work
