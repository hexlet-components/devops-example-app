#!/usr/bin/env bash

set -e

COMMAND="fastify start server/plugin.js -a 0.0.0.0 -l info | pino-pretty -S"

echo $COMMAND
eval $COMMAND
