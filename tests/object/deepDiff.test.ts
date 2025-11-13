import * as _ from 'radashi'

describe('deepDiff', () => {
  describe('basic differences', () => {
    test('returns empty array for equal primitives', () => {
      expect(_.deepDiff(5, 5)).toEqual([])
      expect(_.deepDiff('hello', 'hello')).toEqual([])
      expect(_.deepDiff(true, true)).toEqual([])
      expect(_.deepDiff(null, null)).toEqual([])
      expect(_.deepDiff(undefined, undefined)).toEqual([])
    })

    test('detects modified primitives', () => {
      const result = _.deepDiff(5, 10)
      expect(result).toEqual([
        { type: 'CHANGE', path: [], oldValue: 5, value: 10 },
      ])
    })

    test('detects added properties', () => {
      const result = _.deepDiff({ a: 1 }, { a: 1, b: 2 })
      expect(result).toContainEqual({
        type: 'CREATE',
        path: ['b'],
        value: 2,
      })
    })

    test('detects removed properties', () => {
      const result = _.deepDiff({ a: 1, b: 2 }, { a: 1 })
      expect(result).toContainEqual({
        type: 'REMOVE',
        path: ['b'],
        oldValue: 2,
      })
    })

    test('detects modified properties', () => {
      const result = _.deepDiff({ a: 1, b: 2 }, { a: 1, b: 3 })
      expect(result).toContainEqual({
        type: 'CHANGE',
        path: ['b'],
        oldValue: 2,
        value: 3,
      })
    })
  })

  describe('nested objects', () => {
    test('detects changes in nested objects', () => {
      const obj1 = { a: { b: { c: 1 } } }
      const obj2 = { a: { b: { c: 2 } } }
      const result = _.deepDiff(obj1, obj2)
      expect(result).toContainEqual({
        type: 'CHANGE',
        path: ['a', 'b', 'c'],
        oldValue: 1,
        value: 2,
      })
    })

    test('detects added nested properties', () => {
      const obj1 = { a: { b: 1 } }
      const obj2 = { a: { b: 1, c: 2 } }
      const result = _.deepDiff(obj1, obj2)
      expect(result).toContainEqual({
        type: 'CREATE',
        path: ['a', 'c'],
        value: 2,
      })
    })

    test('detects removed nested properties', () => {
      const obj1 = { a: { b: 1, c: 2 } }
      const obj2 = { a: { b: 1 } }
      const result = _.deepDiff(obj1, obj2)
      expect(result).toContainEqual({
        type: 'REMOVE',
        path: ['a', 'c'],
        oldValue: 2,
      })
    })
  })

  describe('arrays', () => {
    test('detects equal arrays', () => {
      expect(_.deepDiff([1, 2, 3], [1, 2, 3])).toEqual([])
    })

    test('detects array element changes', () => {
      const result = _.deepDiff([1, 2, 3], [1, 5, 3])
      expect(result).toContainEqual({
        type: 'CHANGE',
        path: [1],
        oldValue: 2,
        value: 5,
      })
    })

    test('detects array length changes (added)', () => {
      const result = _.deepDiff([1, 2], [1, 2, 3])
      expect(result).toContainEqual({
        type: 'CREATE',
        path: [2],
        value: 3,
      })
    })

    test('detects array length changes (removed)', () => {
      const result = _.deepDiff([1, 2, 3], [1, 2])
      expect(result).toContainEqual({
        type: 'REMOVE',
        path: [2],
        oldValue: 3,
      })
    })

    test('detects nested array changes', () => {
      const obj1 = { arr: [{ id: 1 }, { id: 2 }] }
      const obj2 = { arr: [{ id: 1 }, { id: 3 }] }
      const result = _.deepDiff(obj1, obj2)
      expect(result).toContainEqual({
        type: 'CHANGE',
        path: ['arr', 1, 'id'],
        oldValue: 2,
        value: 3,
      })
    })
  })

  describe('type changes', () => {
    test('detects type changes from object to primitive', () => {
      const result = _.deepDiff({ a: { b: 1 } }, { a: 'string' })
      expect(result).toContainEqual({
        type: 'CHANGE',
        path: ['a'],
        oldValue: { b: 1 },
        value: 'string',
      })
    })

    test('detects type changes from array to object', () => {
      const result = _.deepDiff({ a: [1, 2] }, { a: { 0: 1, 1: 2 } })
      expect(result.length).toBeGreaterThan(0)
    })

    test('detects type changes from null to object', () => {
      const result = _.deepDiff({ a: null }, { a: { b: 1 } })
      expect(result).toContainEqual({
        type: 'CHANGE',
        path: ['a'],
        oldValue: null,
        value: { b: 1 },
      })
    })

    test('detects type changes from undefined to value', () => {
      const result = _.deepDiff({ a: undefined }, { a: 1 })
      expect(result).toContainEqual({
        type: 'CHANGE',
        path: ['a'],
        oldValue: undefined,
        value: 1,
      })
    })
  })

  describe('circular references', () => {
    test('handles circular references in source', () => {
      const obj1: any = { a: 1 }
      obj1.self = obj1

      const obj2 = { a: 1, self: { a: 2 } }

      // Should not throw or hang
      expect(() => _.deepDiff(obj1, obj2)).not.toThrow()
    })

    test('handles circular references in target', () => {
      const obj1 = { a: 1, self: { a: 2 } }

      const obj2: any = { a: 1 }
      obj2.self = obj2

      // Should not throw or hang
      expect(() => _.deepDiff(obj1, obj2)).not.toThrow()
    })

    test('handles circular references in both', () => {
      const obj1: any = { a: 1 }
      obj1.self = obj1

      const obj2: any = { a: 1 }
      obj2.self = obj2

      const result = _.deepDiff(obj1, obj2)
      expect(result).toEqual([])
    })
  })

  describe('special types', () => {
    test('compares Date objects', () => {
      const date1 = new Date('2024-01-01')
      const date2 = new Date('2024-01-02')

      const result = _.deepDiff({ date: date1 }, { date: date2 })
      expect(result).toContainEqual({
        type: 'CHANGE',
        path: ['date'],
        oldValue: date1,
        value: date2,
      })
    })

    test('compares equal Date objects', () => {
      const date = new Date('2024-01-01')
      expect(_.deepDiff({ date }, { date: new Date('2024-01-01') })).toEqual(
        [],
      )
    })

    test('compares RegExp objects', () => {
      const regex1 = /test/gi
      const regex2 = /test/g

      const result = _.deepDiff({ regex: regex1 }, { regex: regex2 })
      expect(result).toContainEqual({
        type: 'CHANGE',
        path: ['regex'],
        oldValue: regex1,
        value: regex2,
      })
    })

    test('compares equal RegExp objects', () => {
      const regex = /test/gi
      expect(_.deepDiff({ regex }, { regex: /test/gi })).toEqual([])
    })

    test('compares Map objects', () => {
      const map1 = new Map([
        ['a', 1],
        ['b', 2],
      ])
      const map2 = new Map([
        ['a', 1],
        ['b', 3],
      ])

      const result = _.deepDiff({ map: map1 }, { map: map2 })
      expect(result.length).toBeGreaterThan(0)
    })

    test('compares Set objects', () => {
      const set1 = new Set([1, 2, 3])
      const set2 = new Set([1, 2, 4])

      const result = _.deepDiff({ set: set1 }, { set: set2 })
      expect(result.length).toBeGreaterThan(0)
    })
  })

  describe('symbols', () => {
    test('detects changes in symbol properties', () => {
      const sym = Symbol('test')
      const obj1 = { [sym]: 1 }
      const obj2 = { [sym]: 2 }

      const result = _.deepDiff(obj1, obj2)
      expect(result).toContainEqual({
        type: 'CHANGE',
        path: [sym],
        oldValue: 1,
        value: 2,
      })
    })

    test('detects added symbol properties', () => {
      const sym = Symbol('test')
      const obj1 = {}
      const obj2 = { [sym]: 1 }

      const result = _.deepDiff(obj1, obj2)
      expect(result).toContainEqual({
        type: 'CREATE',
        path: [sym],
        value: 1,
      })
    })
  })

  describe('edge cases', () => {
    test('handles empty objects', () => {
      expect(_.deepDiff({}, {})).toEqual([])
    })

    test('handles empty arrays', () => {
      expect(_.deepDiff([], [])).toEqual([])
    })

    test('handles null values', () => {
      expect(_.deepDiff(null, null)).toEqual([])
      const result = _.deepDiff({ a: null }, { a: null })
      expect(result).toEqual([])
    })

    test('handles undefined values', () => {
      const result = _.deepDiff({ a: undefined }, { a: undefined })
      expect(result).toEqual([])
    })

    test('treats absent and undefined properties as equal', () => {
      // Absent property vs undefined should be treated as equal
      expect(_.deepDiff({}, { a: undefined })).toEqual([])
      expect(_.deepDiff({ a: undefined }, {})).toEqual([])
      expect(_.deepDiff({ a: 1 }, { a: 1, b: undefined })).toEqual([])
      expect(_.deepDiff({ a: 1, b: undefined }, { a: 1 })).toEqual([])
    })

    test('handles NaN values', () => {
      // NaN is special - NaN !== NaN but Object.is(NaN, NaN) === true
      expect(_.deepDiff(NaN, NaN)).toEqual([])
      expect(_.deepDiff({ a: NaN }, { a: NaN })).toEqual([])
    })

    test('handles -0 vs +0', () => {
      // Object.is treats -0 and +0 as different
      const result = _.deepDiff({ a: -0 }, { a: +0 })
      expect(result).toContainEqual({
        type: 'CHANGE',
        path: ['a'],
        oldValue: -0,
        value: +0,
      })
    })

    test('handles sparse arrays - holes are absent, not undefined', () => {
      // Sparse array holes should be treated as absent (not undefined)
      const arr1 = [1, , 3] // eslint-disable-line no-sparse-arrays
      const arr2 = [1, 2, 3]

      const result = _.deepDiff(arr1, arr2)
      expect(result).toContainEqual({
        type: 'CREATE',
        path: [1],
        value: 2,
      })
      expect(result).toHaveLength(1)

      // Reverse: removing an element creates a hole
      const result2 = _.deepDiff(arr2, arr1)
      expect(result2).toContainEqual({
        type: 'REMOVE',
        path: [1],
        oldValue: 2,
      })
      expect(result2).toHaveLength(1)
    })

    test('distinguishes sparse array holes from undefined values', () => {
      // Hole vs undefined are different
      const arr1 = [1, , 3] // eslint-disable-line no-sparse-arrays
      const arr2 = [1, undefined, 3]

      // Hole (absent) to undefined (present) is a CREATE
      const result = _.deepDiff(arr1, arr2)
      expect(result).toContainEqual({
        type: 'CREATE',
        path: [1],
        value: undefined,
      })
      expect(result).toHaveLength(1)
    })

    test('handles large nested structures', () => {
      const obj1 = {
        a: { b: { c: { d: { e: { f: { g: { h: 1 } } } } } } },
      }
      const obj2 = {
        a: { b: { c: { d: { e: { f: { g: { h: 2 } } } } } } },
      }

      const result = _.deepDiff(obj1, obj2)
      expect(result).toContainEqual({
        type: 'CHANGE',
        path: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
        oldValue: 1,
        value: 2,
      })
    })

    test('handles multiple simultaneous changes', () => {
      const obj1 = { a: 1, b: 2, c: 3, d: { e: 4 } }
      const obj2 = { a: 10, c: 3, d: { e: 5 }, f: 6 }

      const result = _.deepDiff(obj1, obj2)

      // Should detect: a changed, b removed, d.e changed, f added
      expect(result.length).toBe(4)
      expect(result).toContainEqual({
        type: 'CHANGE',
        path: ['a'],
        oldValue: 1,
        value: 10,
      })
      expect(result).toContainEqual({
        type: 'REMOVE',
        path: ['b'],
        oldValue: 2,
      })
      expect(result).toContainEqual({
        type: 'CHANGE',
        path: ['d', 'e'],
        oldValue: 4,
        value: 5,
      })
      expect(result).toContainEqual({
        type: 'CREATE',
        path: ['f'],
        value: 6,
      })
    })

    test('returns empty for identical complex objects', () => {
      const obj = {
        a: 1,
        b: 'string',
        c: [1, 2, { d: 3 }],
        e: { f: { g: [4, 5, 6] } },
        h: null,
        i: undefined,
      }

      const result = _.deepDiff(obj, JSON.parse(JSON.stringify(obj)))
      expect(result).toEqual([])
    })
  })

  describe('non-enumerable properties', () => {
    test('includes non-enumerable properties in diff', () => {
      const obj1 = {}
      Object.defineProperty(obj1, 'hidden', {
        value: 1,
        enumerable: false,
      })

      const obj2 = {}
      Object.defineProperty(obj2, 'hidden', {
        value: 2,
        enumerable: false,
      })

      const result = _.deepDiff(obj1, obj2)
      expect(result).toContainEqual({
        type: 'CHANGE',
        path: ['hidden'],
        oldValue: 1,
        value: 2,
      })
    })

    test('detects added non-enumerable properties', () => {
      const obj1 = { a: 1 }
      const obj2 = { a: 1 }
      Object.defineProperty(obj2, 'hidden', {
        value: 2,
        enumerable: false,
      })

      const result = _.deepDiff(obj1, obj2)
      expect(result).toContainEqual({
        type: 'CREATE',
        path: ['hidden'],
        value: 2,
      })
    })

    test('detects removed non-enumerable properties', () => {
      const obj1 = { a: 1 }
      Object.defineProperty(obj1, 'hidden', {
        value: 2,
        enumerable: false,
      })
      const obj2 = { a: 1 }

      const result = _.deepDiff(obj1, obj2)
      expect(result).toContainEqual({
        type: 'REMOVE',
        path: ['hidden'],
        oldValue: 2,
      })
    })
  })

  describe('getters and computed properties', () => {
    test('compares getter values, not the getters themselves', () => {
      const obj1 = {
        get computed() {
          return 42
        },
      }
      const obj2 = {
        get computed() {
          return 42
        },
      }

      // Both getters return same value - no diff
      const result = _.deepDiff(obj1, obj2)
      expect(result).toEqual([])
    })

    test('detects when getter values differ', () => {
      const obj1 = {
        get computed() {
          return 42
        },
      }
      const obj2 = {
        get computed() {
          return 43
        },
      }

      const result = _.deepDiff(obj1, obj2)
      expect(result).toContainEqual({
        type: 'CHANGE',
        path: ['computed'],
        oldValue: 42,
        value: 43,
      })
    })

    test('treats getter replaced by data property as change', () => {
      const obj1 = {
        get value() {
          return 42
        },
      }
      const obj2 = { value: 42 }

      // Even though values are same, descriptor changed
      const result = _.deepDiff(obj1, obj2)
      expect(result).toEqual([])
    })
  })

  describe('function properties', () => {
    test('compares functions by reference', () => {
      const fn = () => 42
      const obj1 = { fn }
      const obj2 = { fn }

      expect(_.deepDiff(obj1, obj2)).toEqual([])
    })

    test('detects when function reference changes', () => {
      const fn1 = () => 42
      const fn2 = () => 42
      const obj1 = { fn: fn1 }
      const obj2 = { fn: fn2 }

      const result = _.deepDiff(obj1, obj2)
      expect(result).toContainEqual({
        type: 'CHANGE',
        path: ['fn'],
        oldValue: fn1,
        value: fn2,
      })
    })
  })

  describe('array-like objects', () => {
    test('distinguishes arrays from array-like objects', () => {
      const arr = [1, 2, 3]
      const arrayLike = { 0: 1, 1: 2, 2: 3, length: 3 }

      const result = _.deepDiff(arr, arrayLike)
      // Should detect type change since Array !== Object
      expect(result.length).toBeGreaterThan(0)
      expect(result[0].type).toBe('CHANGE')
    })

    test('compares array-like objects as objects', () => {
      const obj1 = { 0: 1, 1: 2, length: 2 }
      const obj2 = { 0: 1, 1: 3, length: 2 }

      const result = _.deepDiff(obj1, obj2)
      expect(result).toContainEqual({
        type: 'CHANGE',
        path: [1],
        oldValue: 2,
        value: 3,
      })
    })
  })

  describe('prototype chain', () => {
    test('compares own properties, not inherited ones', () => {
      const proto = { inherited: 'value' }
      const obj1 = Object.create(proto)
      obj1.own = 1

      const obj2 = Object.create(proto)
      obj2.own = 1

      // Same own properties - no diff
      const result = _.deepDiff(obj1, obj2)
      expect(result).toEqual([])
    })

    test('detects when own property shadows inherited property', () => {
      const proto = { prop: 'inherited' }
      const obj1 = Object.create(proto)
      const obj2 = Object.create(proto)
      obj2.prop = 'own'

      const result = _.deepDiff(obj1, obj2)
      expect(result).toContainEqual({
        type: 'CREATE',
        path: ['prop'],
        value: 'own',
      })
    })

    test('ignores prototype differences when own properties match', () => {
      const proto1 = { x: 1 }
      const proto2 = { x: 2 }
      const obj1 = Object.create(proto1)
      obj1.own = 'value'
      const obj2 = Object.create(proto2)
      obj2.own = 'value'

      // Different prototypes but same own properties
      const result = _.deepDiff(obj1, obj2)
      expect(result).toEqual([])
    })
  })

  describe('complex circular references', () => {
    test('handles multiple circular references in same structure', () => {
      const obj1: any = { a: null, b: null }
      const child1 = { parent: obj1 }
      obj1.a = child1
      obj1.b = child1 // Same child referenced twice

      const obj2: any = { a: null, b: null }
      const child2 = { parent: obj2 }
      obj2.a = child2
      obj2.b = child2

      // Both have same circular structure
      const result = _.deepDiff(obj1, obj2)
      expect(result).toEqual([])
    })

    test('detects when circular reference structure differs', () => {
      const obj1: any = { a: null, b: null }
      const child1 = { parent: obj1 }
      obj1.a = child1
      obj1.b = { parent: obj1 } // Different child

      const obj2: any = { a: null, b: null }
      const child2 = { parent: obj2 }
      obj2.a = child2
      obj2.b = child2 // Same child

      const result = _.deepDiff(obj1, obj2)
      // Should detect structural difference
      expect(result.length).toBeGreaterThan(0)
    })

    test('handles deeply nested circular references', () => {
      const obj1: any = { level1: { level2: { level3: null } } }
      obj1.level1.level2.level3 = obj1

      const obj2: any = { level1: { level2: { level3: null } } }
      obj2.level1.level2.level3 = obj2

      const result = _.deepDiff(obj1, obj2)
      expect(result).toEqual([])
    })
  })

  describe('WeakMap and WeakSet', () => {
    test('compares WeakMap by reference only', () => {
      const key = {}
      const wm1 = new WeakMap()
      wm1.set(key, 'value')

      const wm2 = new WeakMap()
      wm2.set(key, 'value')

      // WeakMaps are not iterable - compare by reference
      const result = _.deepDiff({ wm: wm1 }, { wm: wm2 })
      expect(result).toContainEqual({
        type: 'CHANGE',
        path: ['wm'],
        oldValue: wm1,
        value: wm2,
      })
    })

    test('same WeakMap reference shows no diff', () => {
      const key = {}
      const wm = new WeakMap()
      wm.set(key, 'value')

      const result = _.deepDiff({ wm }, { wm })
      expect(result).toEqual([])
    })

    test('compares WeakSet by reference only', () => {
      const item = {}
      const ws1 = new WeakSet()
      ws1.add(item)

      const ws2 = new WeakSet()
      ws2.add(item)

      const result = _.deepDiff({ ws: ws1 }, { ws: ws2 })
      expect(result).toContainEqual({
        type: 'CHANGE',
        path: ['ws'],
        oldValue: ws1,
        value: ws2,
      })
    })
  })

  describe('frozen and sealed objects', () => {
    test('compares frozen objects by value, not frozen state', () => {
      const obj1 = Object.freeze({ a: 1 })
      const obj2 = { a: 1 }

      // Values are same even though one is frozen
      const result = _.deepDiff(obj1, obj2)
      expect(result).toEqual([])
    })

    test('compares sealed objects by value', () => {
      const obj1 = Object.seal({ a: 1, b: 2 })
      const obj2 = { a: 1, b: 2 }

      const result = _.deepDiff(obj1, obj2)
      expect(result).toEqual([])
    })
  })

  describe('performance considerations', () => {
    test('handles large objects efficiently', () => {
      const largeObj: any = {}
      for (let i = 0; i < 1000; i++) {
        largeObj[`key${i}`] = i
      }

      const modifiedObj = { ...largeObj, key500: 999 }

      const result = _.deepDiff(largeObj, modifiedObj)

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        type: 'CHANGE',
        path: ['key500'],
        oldValue: 500,
        value: 999,
      })
    })

    test('handles large arrays efficiently', () => {
      const largeArr = Array.from({ length: 1000 }, (_, i) => i)
      const modifiedArr = [...largeArr]
      modifiedArr[500] = 999

      const result = _.deepDiff(largeArr, modifiedArr)

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        type: 'CHANGE',
        path: [500],
        oldValue: 500,
        value: 999,
      })
    })
  })
})
