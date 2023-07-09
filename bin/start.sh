#!/usr/bin/env bash

set -e

npx fastify start server/plugin.js -a 0.0.0.0 -l info -P
