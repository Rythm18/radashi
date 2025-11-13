/**
 * Compare two values and return an array of differences. Each difference
 * includes the type of change, the path to the changed value, and the old
 * and new values.
 *
 * Handles circular references, nested objects, arrays, Maps, Sets, Dates,
 * RegExp, symbols, and all primitive types.
 *
 * @see https://radashi.js.org/reference/object/deepDiff
 * @example
 * ```ts
 * const obj1 = { a: 1, b: { c: 2 } }
 * const obj2 = { a: 1, b: { c: 3 }, d: 4 }
 *
 * deepDiff(obj1, obj2)
 * // [
 * //   { type: 'CHANGE', path: ['b', 'c'], oldValue: 2, value: 3 },
 * //   { type: 'CREATE', path: ['d'], value: 4 }
 * // ]
 * ```
 * @version 12.2.0
 */
export function deepDiff(
  oldValue: any,
  newValue: any,
  path: Array<string | number | symbol> = [],
  visited: WeakMap<object, object> = new WeakMap(),
): Difference[] {
  // If values are identical (including NaN), no difference
  if (Object.is(oldValue, newValue)) {
    return []
  }

  // Handle special cases for Date and RegExp
  if (oldValue instanceof Date && newValue instanceof Date) {
    if (oldValue.getTime() === newValue.getTime()) {
      return []
    }
    return [{ type: 'CHANGE', path, oldValue, value: newValue }]
  }

  if (oldValue instanceof RegExp && newValue instanceof RegExp) {
    if (oldValue.toString() === newValue.toString()) {
      return []
    }
    return [{ type: 'CHANGE', path, oldValue, value: newValue }]
  }

  // If either is not an object, it's a change
  if (
    typeof oldValue !== 'object' ||
    oldValue === null ||
    typeof newValue !== 'object' ||
    newValue === null
  ) {
    return [{ type: 'CHANGE', path, oldValue, value: newValue }]
  }

  // Handle circular references
  if (visited.has(oldValue)) {
    // If we've seen this object before, check if it's the same reference
    if (visited.get(oldValue) === newValue) {
      return []
    }
    // Different circular reference - treat as change
    return [{ type: 'CHANGE', path, oldValue, value: newValue }]
  }

  // Track this object to detect cycles
  visited.set(oldValue, newValue)

  const differences: Difference[] = []

  // Handle Maps
  if (oldValue instanceof Map && newValue instanceof Map) {
    const allKeys = new Set([...oldValue.keys(), ...newValue.keys()])

    for (const key of allKeys) {
      if (!oldValue.has(key)) {
        differences.push({
          type: 'CREATE',
          path: [...path, `Map.${String(key)}`],
          value: newValue.get(key),
        })
      } else if (!newValue.has(key)) {
        differences.push({
          type: 'REMOVE',
          path: [...path, `Map.${String(key)}`],
          oldValue: oldValue.get(key),
        })
      } else {
        const nested = deepDiff(
          oldValue.get(key),
          newValue.get(key),
          [...path, `Map.${String(key)}`],
          visited,
        )
        differences.push(...nested)
      }
    }

    return differences
  }

  // Handle Sets
  if (oldValue instanceof Set && newValue instanceof Set) {
    const oldArray = Array.from(oldValue)
    const newArray = Array.from(newValue)

    // Convert to arrays and compare
    const nested = deepDiff(oldArray, newArray, [...path, 'Set'], visited)
    differences.push(...nested)
    return differences
  }

  // Handle arrays
  if (Array.isArray(oldValue) && Array.isArray(newValue)) {
    const maxLength = Math.max(oldValue.length, newValue.length)

    for (let i = 0; i < maxLength; i++) {
      const hasOld = i in oldValue
      const hasNew = i in newValue

      if (!hasOld && hasNew) {
        differences.push({
          type: 'CREATE',
          path: [...path, i],
          value: newValue[i],
        })
      } else if (hasOld && !hasNew) {
        differences.push({
          type: 'REMOVE',
          path: [...path, i],
          oldValue: oldValue[i],
        })
      } else if (hasOld && hasNew) {
        const nested = deepDiff(
          oldValue[i],
          newValue[i],
          [...path, i],
          visited,
        )
        differences.push(...nested)
      }
    }

    return differences
  }

  // Type mismatch (e.g., array vs object, or different constructor types)
  if (
    Array.isArray(oldValue) !== Array.isArray(newValue) ||
    oldValue.constructor !== newValue.constructor
  ) {
    return [{ type: 'CHANGE', path, oldValue, value: newValue }]
  }

  // Handle plain objects
  const oldKeys = Reflect.ownKeys(oldValue)
  const newKeys = Reflect.ownKeys(newValue)
  const allKeys = new Set([...oldKeys, ...newKeys])

  for (const key of allKeys) {
    const hasOld = Reflect.has(oldValue, key)
    const hasNew = Reflect.has(newValue, key)
    const oldVal = oldValue[key]
    const newVal = newValue[key]

    // Treat absent and undefined as equal
    const isOldUndefined = !hasOld || oldVal === undefined
    const isNewUndefined = !hasNew || newVal === undefined

    if (isOldUndefined && isNewUndefined) {
      // Both are absent or undefined - skip
      continue
    }

    if (!hasOld && hasNew && newVal !== undefined) {
      differences.push({
        type: 'CREATE',
        path: [...path, key],
        value: newVal,
      })
    } else if (hasOld && !hasNew && oldVal !== undefined) {
      differences.push({
        type: 'REMOVE',
        path: [...path, key],
        oldValue: oldVal,
      })
    } else if (!isOldUndefined && !isNewUndefined) {
      const nested = deepDiff(oldVal, newVal, [...path, key], visited)
      differences.push(...nested)
    }
  }

  return differences
}

/**
 * Represents a difference between two values.
 */
export type Difference =
  | {
      type: 'CREATE'
      path: Array<string | number | symbol>
      value: any
    }
  | {
      type: 'REMOVE'
      path: Array<string | number | symbol>
      oldValue: any
    }
  | {
      type: 'CHANGE'
      path: Array<string | number | symbol>
      oldValue: any
      value: any
    }
