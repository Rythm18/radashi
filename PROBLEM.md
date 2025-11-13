# Deep Diff for Objects and Values

## Problem Brief

Implement a `deepDiff` function that compares two values and returns an array of differences with detailed paths, change types, and old/new values. This is essential for state management, change tracking, debugging complex data structures, and building undo/redo systems.

## Agent Instructions

Create a comprehensive diff utility that handles all JavaScript types and edge cases.

**Core functionality:**
- Return array of difference objects with `type`, `path`, `oldValue`/`value` fields
- Change types: `CREATE` (added), `REMOVE` (deleted), `CHANGE` (modified)
- Paths as arrays of keys/indices (e.g., `['user', 'address', 'city']`)
- Recursive traversal for nested objects and arrays
- Handle circular references without infinite loops (use WeakMap for tracking)

**Type support:**
- Objects, Arrays, Maps, Sets, Dates, RegExp
- Symbols, primitives (NaN, -0/+0 distinction)
- Sparse arrays

**Behavior requirements:**
- Return empty array for equal values (including same circular references)
- Treat absent and undefined properties as equal (e.g., `{}` equals `{a: undefined}`)
- Detect type mismatches (array ↔ object, null ↔ object)
- Use `Object.is()` for primitive comparison (handles NaN, -0/+0)
- Use `Reflect.ownKeys()` to include symbols

**Performance considerations:**
- Avoid unnecessary traversals when values are identical
- Handle large objects (1000+ keys) and deep nesting efficiently

Follow patterns in `/src/object/`. Export proper TypeScript types for the diff result.

**Development workflow:**
1. Apply `test.patch` - tests will fail (TDD approach)
2. Implement following these instructions  
3. Verify with `./test.sh new` - all tests must pass
4. Ensure `./test.sh base` still passes

## Test Assumptions

Function exports `deepDiff` and `Difference` type from `/src/object/deepDiff.ts`. Main export in `/src/mod.ts`.
