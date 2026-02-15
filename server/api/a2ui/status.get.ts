/**
 * Returns whether a server-side Gemini API key is configured.
 * Used by the playground to determine if BYOK input is required.
 * Does NOT expose the actual key — only a boolean flag.
 */
export default defineEventHandler(() => {
  const hasKey = !!process.env.GEMINI_API_KEY?.trim()
  return { hasServerKey: hasKey }
})
