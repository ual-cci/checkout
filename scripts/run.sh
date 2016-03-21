#!/bin/bash

# This will need to be run in the root of repo: docker build -t lcc-checkout . 

docker run --name mongodb -v /Users/Staff/Sites/checkout:/data -d mongo:latest

sleep 10;

docker run -d \
    --name checkout \
    --link mongodb:mongo \
    -p 80:80 \
    -e ME_CONFIG_OPTIONS_EDITORTHEME="ambiance" \
    -e ME_CONFIG_BASICAUTH_USERNAME="" \
    lcc-checkout