#!/bin/bash

# Test script for deepDiff feature implementation
# Usage:
#   ./test.sh base  - Run base repository tests (excludes new deepDiff tests)
#   ./test.sh new   - Run new deepDiff tests only

set -e

case "$1" in
  base)
    echo "Running base repository tests (excluding deepDiff tests)..."
    # Run all tests except deepDiff by explicitly listing test files
    pnpm exec vitest run --coverage $(find tests -name "*.test.ts" ! -name "deepDiff.test.ts" | tr '\n' ' ')
    ;;
  new)
    echo "Running new deepDiff tests..."
    pnpm test tests/object/deepDiff.test.ts
    ;;
  *)
    echo "Usage: $0 {base|new}"
    echo "  base - Run base repository tests (excludes new deepDiff tests)"
    echo "  new  - Run new deepDiff tests only"
    exit 1
    ;;
esac
