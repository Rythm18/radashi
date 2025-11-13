#!/bin/bash

# Test script for slugify feature implementation
# Usage:
#   ./test.sh base  - Run base repository tests (excludes new slugify tests)
#   ./test.sh new   - Run new slugify tests only

set -e

case "$1" in
  base)
    echo "Running base repository tests (excluding slugify tests)..."
    # Run all tests except slugify by using find to explicitly list test files
    pnpm exec vitest run --coverage $(find tests -name "*.test.ts" ! -name "slugify.test.ts" | tr '\n' ' ')
    ;;
  new)
    echo "Running new slugify tests..."
    pnpm test tests/string/slugify.test.ts
    ;;
  *)
    echo "Usage: $0 {base|new}"
    echo "  base - Run base repository tests (excludes new slugify tests)"
    echo "  new  - Run new slugify tests only"
    exit 1
    ;;
esac
