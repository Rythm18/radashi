/**
 * Converts a string to a URL-friendly slug. The string is normalized to
 * lowercase, special characters are removed, and spaces are replaced with
 * hyphens. Supports transliteration of accented characters (e.g., é → e).
 *
 * @see https://radashi.js.org/reference/string/slugify
 * @example
 * ```ts
 * slugify('Hello World') // => 'hello-world'
 * slugify('Café au Lait') // => 'cafe-au-lait'
 * slugify('Node.js is Great!') // => 'nodejs-is-great'
 * ```
 * @version 12.2.0
 */
export function slugify(str: string): string {
  if (!str) {
    return ''
  }

  // Normalize unicode characters and decompose accented characters
  const normalized = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

  // Convert to lowercase
  let slug = normalized.toLowerCase()

  // Replace camelCase boundaries with hyphens (e.g., helloWorld -> hello-world)
  slug = slug.replace(/([a-z])([A-Z])/g, '$1-$2')

  // Replace multiple uppercase letters (e.g., XMLHttp -> xml-http)
  slug = slug.replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')

  // Replace non-alphanumeric characters (except hyphens) with hyphens
  // Keep numbers, lowercase letters, and hyphens
  slug = slug.replace(/[^a-z0-9-]+/g, '-')

  // Replace multiple consecutive hyphens with a single hyphen
  slug = slug.replace(/-+/g, '-')

  // Remove leading and trailing hyphens
  slug = slug.replace(/^-+|-+$/g, '')

  return slug
}
