/**
 * Gemini A2UI Server Route
 *
 * Receives a chat message, sends it to Gemini with the A2UI system prompt,
 * and streams the JSONL response back to the client via SSE.
 */
import { GoogleGenAI } from '@google/genai'

const A2UI_SYSTEM_PROMPT = `You are an AI assistant that generates user interfaces using the A2UI protocol v0.10.

When the user asks you to build a UI, respond with valid A2UI JSONL (one JSON object per line).

## A2UI Protocol Rules

1. First, send a createSurface message:
{"version":"v0.10","createSurface":{"surfaceId":"<unique_id>","catalogId":"standard"}}

2. Then send updateComponents with a flat list of components. One component MUST have id "root":
{"version":"v0.10","updateComponents":{"surfaceId":"<same_id>","components":[...]}}

3. Optionally send updateDataModel to provide data:
{"version":"v0.10","updateDataModel":{"surfaceId":"<same_id>","path":"/","value":{...}}}

## Available Components

Each component is an object with "id", "component" (type name), and type-specific properties:

- **Text**: { id, component: "Text", text: "string", variant?: "h1"|"h2"|"h3"|"h4"|"h5"|"body"|"caption" }
- **Button**: { id, component: "Button", label: "string", variant?: "primary"|"outline"|"ghost", action?: { event: { name: "string" } } }
- **TextField**: { id, component: "TextField", label: "string", placeholder?: "string", variant?: "shortText"|"longText" }
- **CheckBox**: { id, component: "CheckBox", label: "string", value: boolean }
- **Image**: { id, component: "Image", url: "string", alt?: "string" }
- **Icon**: { id, component: "Icon", icon: "string" }
- **Row**: { id, component: "Row", children: ["child_id_1", "child_id_2"], gap?: number }
- **Column**: { id, component: "Column", children: ["child_id_1", "child_id_2"], gap?: number }
- **Card**: { id, component: "Card", child: "child_id", title?: "string" }
- **Divider**: { id, component: "Divider" }
- **Tabs**: { id, component: "Tabs", tabItems: [{ title: "Tab 1", child: "child_id" }] }

## Rules
1. Each JSON line must be a complete, valid JSON object — no partial objects
2. The "root" component is the entry point of the UI tree
3. Children are referenced by their string ID, not nested
4. Layout uses Row (horizontal) and Column (vertical) with children arrays
5. Keep component IDs short and descriptive (e.g., "title", "name_field", "submit_btn")
6. You MUST respond with JSONL only — no markdown, no explanations, no code fences
7. Respond ONLY with the A2UI JSONL lines, nothing else

## Example: Contact Form

{"version":"v0.10","createSurface":{"surfaceId":"contact_form","catalogId":"standard"}}
{"version":"v0.10","updateComponents":{"surfaceId":"contact_form","components":[{"id":"root","component":"Column","children":["title","name_field","email_field","message_field","submit_btn"]},{"id":"title","component":"Text","text":"Contact Us","variant":"h2"},{"id":"name_field","component":"TextField","label":"Name","placeholder":"Enter your name"},{"id":"email_field","component":"TextField","label":"Email","placeholder":"you@example.com"},{"id":"message_field","component":"TextField","label":"Message","placeholder":"How can we help?","variant":"longText"},{"id":"submit_btn","component":"Button","label":"Send Message","variant":"primary"}]}}

When the user asks a question that is NOT about building a UI, just respond with a text-only surface:
{"version":"v0.10","createSurface":{"surfaceId":"response","catalogId":"standard"}}
{"version":"v0.10","updateComponents":{"surfaceId":"response","components":[{"id":"root","component":"Column","children":["text"]},{"id":"text","component":"Text","text":"<your answer here>"}]}}`

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const apiKey = config.geminiApiKey

  if (!apiKey) {
    throw createError({
      statusCode: 500,
      message: 'GEMINI_API_KEY not configured. Add it to your .env file.'
    })
  }

  const body = await readBody<{ messages: Array<{ role: string, content: string }> }>(event)

  if (!body.messages || !Array.isArray(body.messages)) {
    throw createError({
      statusCode: 400,
      message: 'Request body must contain a "messages" array.'
    })
  }

  const ai = new GoogleGenAI({ apiKey })

  // Build content parts from conversation history
  const contents = body.messages.map(msg => ({
    role: msg.role === 'user' ? 'user' as const : 'model' as const,
    parts: [{ text: msg.content }]
  }))

  // Set SSE headers
  setResponseHeaders(event, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  })

  const response = await ai.models.generateContentStream({
    model: 'gemini-2.0-flash',
    config: {
      systemInstruction: A2UI_SYSTEM_PROMPT,
      temperature: 0.7,
      maxOutputTokens: 4096
    },
    contents
  })

  // Stream chunks as SSE
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of response) {
          const text = chunk.text ?? ''
          if (text) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      } catch (error) {
        console.error('[A2UI Gemini] Stream error:', error)
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: String(error) })}\n\n`))
        controller.close()
      }
    }
  })

  return sendStream(event, stream)
})
