#!/usr/bin/env bash

set -e

COMMAND="fastify start server/plugin.js -a 0.0.0.0 -l info --pretty-logs"

echo $COMMAND
exec $COMMAND
