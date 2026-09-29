#!/bin/sh
set -eu

# Migration failure must stop startup. Use the installed CLI without npx downloads.
node node_modules/drizzle-kit/bin.cjs migrate

# Only a fully successful build is reusable. BUILD_ID alone may survive a failed build.
# This marker lives in the container layer; replacing the image always builds afresh.
if [ ! -f .next/.startup-build-complete ] || [ ! -f .next/BUILD_ID ]; then
  rm -f .next/.startup-build-complete
  build_heap_mb="${BLOG_BUILD_HEAP_MB:-1024}"
  case "$build_heap_mb" in
    ''|*[!0-9]*|0) echo 'BLOG_BUILD_HEAP_MB must be a positive integer' >&2; exit 1 ;;
  esac
  echo "Building application (V8 old-space limit: ${build_heap_mb} MiB per process)..."
  NODE_OPTIONS="${NODE_OPTIONS:-} --max-old-space-size=${build_heap_mb}" npm run build
  touch .next/.startup-build-complete
else
  echo 'Reusing completed application build.'
fi

# Forward container stop signals directly to Next.js.
exec node node_modules/next/dist/bin/next start
