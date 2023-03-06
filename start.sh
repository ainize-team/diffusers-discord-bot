#!/bin/sh

[ ! -z "$DEPLOY_COMMAND" ] && yarn deploy

yarn start