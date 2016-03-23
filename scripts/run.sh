#!/bin/bash

# This will need to be run in the root of repo: docker build -t lcc-checkout . 

docker run --name mongo -v /Users/Staff/Sites/checkout:/data -d mongo:latest

sleep 10;

docker run -d \
    --name checkout \
    --link mongo:mongo \
    -p 80:80 \
    -e ME_CONFIG_OPTIONS_EDITORTHEME="ambiance" \
    -e ME_CONFIG_BASICAUTH_USERNAME="" \
    checkout



# --env-file .env \