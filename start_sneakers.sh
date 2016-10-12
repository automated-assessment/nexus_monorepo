#!/bin/bash
export $(cat .env.file | xargs) && rake sneakers:work
