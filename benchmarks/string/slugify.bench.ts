import * as _ from 'radashi'

describe('slugify', () => {
  bench('with basic string', () => {
    _.slugify('Hello World')
  })

  bench('with complex string', () => {
    _.slugify('The Quick Brown Fox Jumps Over The Lazy Dog')
  })

  bench('with accented characters', () => {
    _.slugify('Crème brûlée in São Paulo')
  })

  bench('with camelCase', () => {
    _.slugify('XMLHttpRequest')
  })

  bench('with special characters', () => {
    _.slugify('Node.js vs Deno: Which is Better?')
  })
})
