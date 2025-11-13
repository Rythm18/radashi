# Add Async Memoization with Cache Management

## Problem Brief

Add memoization support for async functions with cache expiration and size limiting. The existing `memo` function only works with synchronous functions. We need async support for API calls, database queries, and other promise-based operations.

## Agent Instructions

Implement an async memoization function in the curry module that caches promise results based on function arguments. Support three key features:

1. **Concurrent request deduplication**: When multiple calls with identical arguments happen before the first completes, return the same promise instance instead of making duplicate requests.

2. **TTL-based expiration**: Accept an optional `ttl` (milliseconds) to automatically expire cached values after the specified time.

3. **LRU cache eviction**: Accept an optional `maxSize` to limit cache entries. When exceeded, remove the least recently used entry. Cache hits should update the access time.

**Key behaviors:**
- Default cache key uses JSON serialization of arguments
- Support custom key function via options
- Errors should NOT be cached—allow retries
- After async operation completes, store the resolved value (not the promise)
- TTL and maxSize can be used together

Follow the same API pattern as the existing `memo` function with options object for configuration.

## Test Assumptions

- Export as `memoizeAsync` from the curry module
- Function signature: `memoizeAsync(asyncFunc, options?)` where options supports `key`, `ttl`, and `maxSize`
