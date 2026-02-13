/**
 * Minimal nanoid implementation — generates short unique IDs.
 * No external dependency needed.
 */
export function nanoid(size = 21): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let id = ''
  const values = new Uint8Array(size)
  crypto.getRandomValues(values)
  for (let i = 0; i < size; i++) {
    id += chars[values[i]! % chars.length]
  }
  return id
}
