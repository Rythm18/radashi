#!/bin/bash

set -e

case "$1" in
  base)
    echo "Running base tests (existing repo tests)..."
    pnpm test
    ;;
  new)
    echo "Running new memoizeAsync feature tests..."
    pnpm vitest run tests/curry/memoizeAsync.test.ts
    ;;
  *)
    echo "Usage: $0 {base|new}"
    echo "  base - Run all existing repository tests"
    echo "  new  - Run only the new memoizeAsync feature tests"
    exit 1
    ;;
esac
