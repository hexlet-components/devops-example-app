#!/bin/sh
set -eu

source_dir=$(CDPATH='' cd -- "$(dirname -- "$0")" && pwd)
docker build --file "$source_dir/Dockerfile.production" --target runtime --tag docker-course:1.0.0 "$source_dir"
