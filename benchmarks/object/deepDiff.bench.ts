import * as _ from 'radashi'

describe('deepDiff', () => {
  bench('with shallow object changes', () => {
    const obj1 = { a: 1, b: 2, c: 3, d: 4, e: 5 }
    const obj2 = { a: 1, b: 3, c: 3, d: 4, f: 6 }
    _.deepDiff(obj1, obj2)
  })

  bench('with deep nested objects', () => {
    const obj1 = { a: { b: { c: { d: { e: { f: 1 } } } } } }
    const obj2 = { a: { b: { c: { d: { e: { f: 2 } } } } } }
    _.deepDiff(obj1, obj2)
  })

  bench('with arrays', () => {
    const arr1 = Array.from({ length: 100 }, (_, i) => i)
    const arr2 = Array.from({ length: 100 }, (_, i) => (i === 50 ? 999 : i))
    _.deepDiff(arr1, arr2)
  })

  bench('with large objects', () => {
    const obj1: any = {}
    const obj2: any = {}
    for (let i = 0; i < 100; i++) {
      obj1[`key${i}`] = i
      obj2[`key${i}`] = i === 50 ? 999 : i
    }
    _.deepDiff(obj1, obj2)
  })

  bench('with no differences', () => {
    const obj = { a: 1, b: { c: 2, d: [3, 4, 5] }, e: 'test' }
    _.deepDiff(obj, JSON.parse(JSON.stringify(obj)))
  })

  bench('with complex mixed structure', () => {
    const obj1 = {
      users: [
        { id: 1, name: 'Alice', tags: ['admin', 'user'] },
        { id: 2, name: 'Bob', tags: ['user'] },
      ],
      settings: { theme: 'dark', lang: 'en' },
    }
    const obj2 = {
      users: [
        { id: 1, name: 'Alice', tags: ['admin', 'user'] },
        { id: 2, name: 'Bobby', tags: ['user', 'moderator'] },
      ],
      settings: { theme: 'light', lang: 'en' },
    }
    _.deepDiff(obj1, obj2)
  })
})
