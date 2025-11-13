import * as _ from 'radashi'

describe('memoizeAsync', () => {
  test('only executes async function once for same arguments', async () => {
    let callCount = 0
    const func = _.memoizeAsync(async (x: number) => {
      callCount++
      return x * 2
    })

    const result1 = await func(5)
    const result2 = await func(5)
    const result3 = await func(5)

    expect(result1).toBe(10)
    expect(result2).toBe(10)
    expect(result3).toBe(10)
    expect(callCount).toBe(1)
  })

  test('executes function for different arguments', async () => {
    let callCount = 0
    const func = _.memoizeAsync(async (x: number) => {
      callCount++
      return x * 2
    })

    const result1 = await func(5)
    const result2 = await func(10)
    const result3 = await func(5)

    expect(result1).toBe(10)
    expect(result2).toBe(20)
    expect(result3).toBe(10)
    expect(callCount).toBe(2)
  })

  test('handles concurrent requests for same key (deduplication)', async () => {
    let callCount = 0
    const func = _.memoizeAsync(async (x: number) => {
      callCount++
      await _.sleep(100)
      return x * 2
    })

    // Fire 3 concurrent calls with same argument
    const [result1, result2, result3] = await Promise.all([
      func(5),
      func(5),
      func(5),
    ])

    expect(result1).toBe(10)
    expect(result2).toBe(10)
    expect(result3).toBe(10)
    expect(callCount).toBe(1) // Should only call once
  })

  test('handles concurrent requests for different keys', async () => {
    let callCount = 0
    const func = _.memoizeAsync(async (x: number) => {
      callCount++
      await _.sleep(50)
      return x * 2
    })

    const [result1, result2, result3] = await Promise.all([
      func(5),
      func(10),
      func(15),
    ])

    expect(result1).toBe(10)
    expect(result2).toBe(20)
    expect(result3).toBe(30)
    expect(callCount).toBe(3)
  })

  test('respects TTL and re-executes after expiration', async () => {
    vi.useFakeTimers()
    let callCount = 0

    const func = _.memoizeAsync(
      async (x: number) => {
        callCount++
        return x * 2
      },
      { ttl: 1000 },
    )

    const result1 = await func(5)
    expect(result1).toBe(10)
    expect(callCount).toBe(1)

    // Advance time but still within TTL
    vi.advanceTimersByTime(500)
    const result2 = await func(5)
    expect(result2).toBe(10)
    expect(callCount).toBe(1) // Still cached

    // Advance time beyond TTL
    vi.advanceTimersByTime(600)
    const result3 = await func(5)
    expect(result3).toBe(10)
    expect(callCount).toBe(2) // Re-executed

    vi.useRealTimers()
  })

  test('uses custom key function to determine cache key', async () => {
    let callCount = 0
    const func = _.memoizeAsync(
      async (obj: { id: string; name: string }) => {
        callCount++
        return obj.name.toUpperCase()
      },
      {
        key: obj => obj.id,
      },
    )

    const result1 = await func({ id: '1', name: 'alice' })
    const result2 = await func({ id: '1', name: 'bob' }) // Same id, different name
    const result3 = await func({ id: '2', name: 'alice' })

    expect(result1).toBe('ALICE')
    expect(result2).toBe('ALICE') // Cached from first call
    expect(result3).toBe('ALICE')
    expect(callCount).toBe(2) // Called for id='1' and id='2'
  })

  test('handles multiple arguments correctly', async () => {
    let callCount = 0
    const func = _.memoizeAsync(async (a: number, b: number, c: number) => {
      callCount++
      return a + b + c
    })

    const result1 = await func(1, 2, 3)
    const result2 = await func(1, 2, 3)
    const result3 = await func(1, 2, 4)

    expect(result1).toBe(6)
    expect(result2).toBe(6)
    expect(result3).toBe(7)
    expect(callCount).toBe(2)
  })

  test('respects maxSize and evicts oldest entries (LRU)', async () => {
    let callCount = 0
    const func = _.memoizeAsync(
      async (x: number) => {
        callCount++
        return x * 2
      },
      { maxSize: 2 },
    )

    await func(1) // Cache: [1]
    await func(2) // Cache: [1, 2]
    await func(3) // Cache: [2, 3] - evicts 1

    callCount = 0 // Reset counter

    await func(2) // Hit
    await func(3) // Hit
    await func(1) // Miss - was evicted

    expect(callCount).toBe(1) // Only func(1) was called again
  })

  test('updates LRU order on cache hit', async () => {
    let callCount = 0
    const func = _.memoizeAsync(
      async (x: number) => {
        callCount++
        return x * 2
      },
      { maxSize: 2 },
    )

    await func(1) // Cache: [1]
    await func(2) // Cache: [1, 2]
    await func(1) // Cache: [2, 1] - accessed 1, moves to end
    await func(3) // Cache: [1, 3] - evicts 2 (least recently used)

    callCount = 0

    await func(1) // Hit
    await func(3) // Hit
    await func(2) // Miss - was evicted

    expect(callCount).toBe(1)
  })

  test('does not cache rejected promises', async () => {
    let callCount = 0
    const func = _.memoizeAsync(async (x: number) => {
      callCount++
      if (x < 0) {
        throw new Error('negative number')
      }
      return x * 2
    })

    await expect(func(-5)).rejects.toThrow('negative number')
    await expect(func(-5)).rejects.toThrow('negative number')

    expect(callCount).toBe(2) // Called twice, errors not cached

    const result = await func(5)
    expect(result).toBe(10)
    expect(callCount).toBe(3)

    // Successful result should be cached
    const result2 = await func(5)
    expect(result2).toBe(10)
    expect(callCount).toBe(3)
  })

  test('handles errors during concurrent requests', async () => {
    let callCount = 0
    const func = _.memoizeAsync(async (x: number) => {
      callCount++
      await _.sleep(50)
      if (x < 0) {
        throw new Error('negative number')
      }
      return x * 2
    })

    const promises = [func(-5), func(-5), func(-5)]

    await expect(Promise.all(promises)).rejects.toThrow('negative number')
    expect(callCount).toBe(1) // Only one call despite concurrent requests
  })

  test('handles mixed success and error concurrent requests', async () => {
    let callCount = 0
    const func = _.memoizeAsync(async (x: number) => {
      callCount++
      await _.sleep(50)
      if (x < 0) {
        throw new Error('negative')
      }
      return x * 2
    })

    const [errorResult1, errorResult2, successResult] = await Promise.allSettled([
      func(-5),
      func(-5),
      func(10),
    ])

    expect(errorResult1.status).toBe('rejected')
    expect(errorResult2.status).toBe('rejected')
    expect(successResult.status).toBe('fulfilled')
    expect((successResult as PromiseFulfilledResult<number>).value).toBe(20)
    expect(callCount).toBe(2)
  })

  test('works with no arguments', async () => {
    let callCount = 0
    const func = _.memoizeAsync(async () => {
      callCount++
      return Math.random()
    })

    const result1 = await func()
    const result2 = await func()

    expect(result1).toBe(result2)
    expect(callCount).toBe(1)
  })

  test('handles complex object arguments without custom key', async () => {
    let callCount = 0
    const func = _.memoizeAsync(async (obj: { a: number; b: string }) => {
      callCount++
      return `${obj.b}-${obj.a}`
    })

    const result1 = await func({ a: 1, b: 'test' })
    const result2 = await func({ a: 1, b: 'test' })
    const result3 = await func({ a: 2, b: 'test' })

    expect(result1).toBe('test-1')
    expect(result2).toBe('test-1')
    expect(result3).toBe('test-2')
    expect(callCount).toBe(2)
  })

  test('handles array arguments', async () => {
    let callCount = 0
    const func = _.memoizeAsync(async (arr: number[]) => {
      callCount++
      return arr.reduce((a, b) => a + b, 0)
    })

    const result1 = await func([1, 2, 3])
    const result2 = await func([1, 2, 3])
    const result3 = await func([1, 2, 4])

    expect(result1).toBe(6)
    expect(result2).toBe(6)
    expect(result3).toBe(7)
    expect(callCount).toBe(2)
  })

  test('maxSize of 1 effectively disables caching after next call', async () => {
    let callCount = 0
    const func = _.memoizeAsync(
      async (x: number) => {
        callCount++
        return x * 2
      },
      { maxSize: 1 },
    )

    await func(1)
    await func(1)
    expect(callCount).toBe(1)

    await func(2)
    await func(1) // Evicted

    expect(callCount).toBe(3)
  })

  test('combining TTL and maxSize', async () => {
    vi.useFakeTimers()
    let callCount = 0

    const func = _.memoizeAsync(
      async (x: number) => {
        callCount++
        return x * 2
      },
      { ttl: 1000, maxSize: 2 },
    )

    await func(1)
    await func(2)
    expect(callCount).toBe(2)

    vi.advanceTimersByTime(500)
    await func(1) // Hit, within TTL
    expect(callCount).toBe(2)

    vi.advanceTimersByTime(600) // Beyond TTL for all
    await func(1) // Miss, expired
    await func(2) // Miss, expired
    expect(callCount).toBe(4)

    vi.useRealTimers()
  })

  test('handles undefined and null as arguments', async () => {
    let callCount = 0
    const func = _.memoizeAsync(async (x: number | null | undefined) => {
      callCount++
      return String(x)
    })

    const result1 = await func(null)
    const result2 = await func(null)
    const result3 = await func(undefined)
    const result4 = await func(undefined)
    const result5 = await func(0)

    expect(result1).toBe('null')
    expect(result2).toBe('null')
    expect(result3).toBe('undefined')
    expect(result4).toBe('undefined')
    expect(result5).toBe('0')
    expect(callCount).toBe(3)
  })

  test('returns same promise for concurrent identical requests', async () => {
    const func = _.memoizeAsync(async (x: number) => {
      await _.sleep(100)
      return x * 2
    })

    const promise1 = func(5)
    const promise2 = func(5)
    const promise3 = func(5)

    // All three should be the exact same promise instance
    expect(promise1).toBe(promise2)
    expect(promise2).toBe(promise3)

    const result = await promise1
    expect(result).toBe(10)
  })

  test('clears in-flight promise after resolution', async () => {
    let callCount = 0
    const func = _.memoizeAsync(async (x: number) => {
      callCount++
      await _.sleep(50)
      return x * 2
    })

    // First call
    await func(5)
    expect(callCount).toBe(1)

    // Second call (should use cached value, not in-flight promise)
    await func(5)
    expect(callCount).toBe(1)
  })

  test('handles very large cache sizes', async () => {
    const func = _.memoizeAsync(
      async (x: number) => x * 2,
      { maxSize: 10000 },
    )

    // Add 10000 entries
    for (let i = 0; i < 10000; i++) {
      await func(i)
    }

    // All should still be cached
    let callCount = 0
    const wrapped = _.memoizeAsync(
      async (x: number) => {
        callCount++
        return x * 2
      },
      { maxSize: 10000 },
    )

    for (let i = 0; i < 10000; i++) {
      await wrapped(i)
    }

    expect(callCount).toBe(10000) // All fresh calls
  })

  test('custom key function receives all arguments', async () => {
    const receivedArgs: any[][] = []
    const func = _.memoizeAsync(
      async (a: number, b: string, c: boolean) => {
        return `${a}-${b}-${c}`
      },
      {
        key: (...args) => {
          receivedArgs.push(args)
          return JSON.stringify(args)
        },
      },
    )

    await func(1, 'test', true)
    await func(1, 'test', true)

    expect(receivedArgs).toHaveLength(2)
    expect(receivedArgs[0]).toEqual([1, 'test', true])
    expect(receivedArgs[1]).toEqual([1, 'test', true])
  })
})
