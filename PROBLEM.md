# URL Slug Generator

## Problem Brief

Add a `slugify` function to the string utilities that converts any string into a URL-friendly slug. This is essential for creating clean, readable URLs from titles and text content. The function should lowercase text, remove special characters, replace spaces with hyphens, and handle accented characters (e.g., "Café" → "cafe").

## Agent Instructions

Implement a string transformation function that produces URL-safe slugs suitable for use in web addresses and file names.

**Core functionality:**
- Convert to lowercase
- Replace spaces and separators with hyphens
- Remove special characters (keep only alphanumeric and hyphens)
- Transliterate accented characters (é→e, ñ→n, ü→u, etc.)
- Handle camelCase by inserting hyphens (helloWorld → hello-world)
- Normalize multiple consecutive hyphens to single hyphens
- Strip leading and trailing hyphens

**Behavior requirements:**
- Empty or whitespace-only strings return empty string
- Non-latin scripts (Chinese, Arabic, etc.) are removed
- Already-slugified strings pass through unchanged
- Dots are removed, slashes become hyphens

Follow existing string function patterns in `/src/string/`. Add corresponding test file, benchmark, documentation, and export statement.

## Test Assumptions

Tests expect a function named `slugify` in `/src/string/slugify.ts` that accepts a string and returns a string. The function should be exported from the main module.
