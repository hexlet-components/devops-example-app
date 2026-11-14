#!/bin/sh
set -eu

if [ "$#" -ne 2 ]; then
  echo 'Usage: sh prepare.sh SLUG TARGET' >&2
  exit 1
fi
slug=$1
target=$2
case "$slug" in
  intro|run|application|container-management|images|network|bind-mounts|image-creation|image-layers|docker-compose|configuration|readiness|development|best-practices|releases|diagnostics) ;;
  *) echo "Unknown lesson: $slug" >&2; exit 1 ;;
esac
source_dir=$(CDPATH='' cd -- "$(dirname -- "$0")" && pwd)
if [ -e "$target" ] && { [ ! -d "$target" ] || [ -n "$(ls -A "$target")" ]; }; then
  echo "Target must be a new or empty directory: $target" >&2
  exit 1
fi
mkdir -p "$target"
for file in package.json pnpm-lock.yaml pnpm-workspace.yaml VERSION message.txt server.mjs .dockerignore .gitignore .gitattributes Dockerfile Dockerfile.production; do
  cp "$source_dir/$file" "$target/$file"
done
for directory in lib scripts ui; do
  cp -R "$source_dir/$directory" "$target/"
done
if [ -d "$source_dir/states/$slug" ]; then
  cp -R "$source_dir/states/$slug/." "$target/"
fi
case "$slug" in
  configuration|readiness|development|best-practices|releases|diagnostics)
    mkdir -p "$target/secrets"
    chmod 755 "$target/secrets"
    printf '%s\n' 'course-password' > "$target/secrets/db-password.txt"
    chmod 644 "$target/secrets/db-password.txt"
    ;;
esac
echo "Prepared $slug in $target"
