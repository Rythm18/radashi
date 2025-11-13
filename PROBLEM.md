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
- Objects (plain, with prototypes, frozen/sealed), Arrays, Maps, Sets
- Dates, RegExp, WeakMap, WeakSet (reference-only)
- Symbols, primitives (NaN, -0/+0), Functions
- Sparse arrays (holes ≠ undefined), array-like objects
- Non-enumerable properties, getters/setters

**Behavior requirements:**
- Equal values → empty array (including same circular refs)
- Objects: absent = undefined (e.g., `{}` = `{a: undefined}`)
- Arrays: holes ≠ undefined (`[1,,3]` ≠ `[1,undefined,3]`)
- Array ≠ array-like object (detect constructor difference)
- Own properties only (ignore inherited via prototype)
- Multiple refs to same object → track with WeakMap to detect structural differences
- WeakMap/WeakSet → compare by reference only (not iterable)
- `Object.is()` for primitives (NaN, -0/+0)
- `Reflect.ownKeys()` for symbols + non-enumerable
- Getters: compare values, not functions
- Functions: by reference
- Frozen/sealed: compare values, ignore mutability state

**Performance:**
Handle large objects (1000+ keys) and deep nesting without unnecessary traversals

Follow patterns in `/src/object/`. Export proper TypeScript types for the diff result.

**Development workflow:**
1. Apply `test.patch` - tests will fail (TDD approach)
2. Implement following these instructions  
3. Verify with `./test.sh new` - all tests must pass
4. Ensure `./test.sh base` still passes

## Test Assumptions

Function exports `deepDiff` and `Difference` type from `/src/object/deepDiff.ts`. Main export in `/src/mod.ts`.
