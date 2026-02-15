/**
 * Multi-Provider A2UI Chat — BYOK (Bring Your Own Key)
 *
 * Accepts provider, apiKey, model, and messages from the client.
 * Routes to the correct LLM API and streams A2UI JSONL back via SSE.
 *
 * Supported providers: gemini, openai, anthropic
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

### Display
- **Text**: { id, component: "Text", text: "string", variant?: "h1"|"h2"|"h3"|"h4"|"h5"|"body"|"caption" }
- **Image**: { id, component: "Image", url: "string", alt?: "string", fit?: "contain"|"cover"|"fill", variant?: "icon"|"avatar"|"smallFeature"|"mediumFeature"|"largeFeature"|"header" }
- **Icon**: { id, component: "Icon", icon: "string" }
- **Video**: { id, component: "Video", url: "string" }
- **AudioPlayer**: { id, component: "AudioPlayer", url: "string", description?: "string" }

### Layout
- **Row**: { id, component: "Row", children: ["child_id_1", "child_id_2"], gap?: number, justify?: "start"|"center"|"end"|"spaceBetween"|"spaceAround"|"spaceEvenly", align?: "start"|"center"|"end"|"stretch" }
- **Column**: { id, component: "Column", children: ["child_id_1", "child_id_2"], gap?: number, justify?: "start"|"center"|"end"|"spaceBetween", align?: "start"|"center"|"end"|"stretch" }
- **List**: { id, component: "List", children: ["child_id_1", "child_id_2"], direction?: "vertical"|"horizontal", align?: "start"|"center"|"end"|"stretch" }
- **Card**: { id, component: "Card", child: "child_id", title?: "string" }
- **Tabs**: { id, component: "Tabs", tabItems: [{ title: "Tab 1", child: "child_id" }] }
- **Divider**: { id, component: "Divider" }

### Overlay
- **Modal**: { id, component: "Modal", trigger: "trigger_child_id", content: "content_child_id" }

### Interactive
- **Button**: { id, component: "Button", label: "string", variant?: "primary"|"outline"|"ghost", action?: { event: { name: "string" } } }

### Input
- **TextField**: { id, component: "TextField", label: "string", placeholder?: "string", variant?: "shortText"|"longText"|"number"|"obscured" }
- **CheckBox**: { id, component: "CheckBox", label: "string", value: boolean }
- **ChoicePicker**: { id, component: "ChoicePicker", options: [{ label: "Option 1", value: "opt1" }], value: ["opt1"], variant?: "mutuallyExclusive"|"multipleSelection", label?: "string" }
- **Slider**: { id, component: "Slider", value: 50, min: 0, max: 100, label?: "string" }
- **DateTimeInput**: { id, component: "DateTimeInput", value: "", enableDate?: true, enableTime?: false, min?: "2026-01-01", max?: "2026-12-31", label?: "string" }

### Data
- **ScrollArea**: { id, component: "ScrollArea", items: [{ title: "string", description?: "string", status?: "pending"|"confirmed"|"cancelled", meta?: "string", icon?: "string" }], orientation?: "vertical"|"horizontal", height?: "h-96"|"h-64"|"h-128", virtualize?: boolean }
- **Carousel**: { id, component: "Carousel", items: ["url1", "url2"] | [{ src: "url", alt?: "string", caption?: "string" }], arrows?: boolean, dots?: boolean, loop?: boolean, autoplay?: boolean | { delay: number }, columns?: 1|2|3|4, orientation?: "horizontal"|"vertical" }
- **Table**: { id, component: "Table", columns: [{ key: "string", label: "string" }], rows: [{ key: "value" }], caption?: "string", striped?: boolean }

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

## Example: Settings Panel with Slider and Choice

{"version":"v0.10","createSurface":{"surfaceId":"settings","catalogId":"standard"}}
{"version":"v0.10","updateComponents":{"surfaceId":"settings","components":[{"id":"root","component":"Column","children":["title","volume_slider","theme_picker","notify_check"]},{"id":"title","component":"Text","text":"Settings","variant":"h2"},{"id":"volume_slider","component":"Slider","label":"Volume","value":75,"min":0,"max":100},{"id":"theme_picker","component":"ChoicePicker","label":"Theme","options":[{"label":"Light","value":"light"},{"label":"Dark","value":"dark"},{"label":"System","value":"system"}],"value":["dark"],"variant":"mutuallyExclusive"},{"id":"notify_check","component":"CheckBox","label":"Enable notifications","value":true}]}}

When the user asks a question that is NOT about building a UI, just respond with a text-only surface:
{"version":"v0.10","createSurface":{"surfaceId":"response","catalogId":"standard"}}
{"version":"v0.10","updateComponents":{"surfaceId":"response","components":[{"id":"root","component":"Column","children":["text"]},{"id":"text","component":"Text","text":"<your answer here>"}]}}`

interface ChatRequest {
  provider: 'gemini' | 'openai' | 'anthropic'
  apiKey: string
  model: string
  messages: Array<{ role: string, content: string }>
}

// --- Gemini streaming ---
async function streamGemini(apiKey: string, model: string, messages: ChatRequest['messages']) {
  const ai = new GoogleGenAI({ apiKey })

  const contents = messages.map(msg => ({
    role: msg.role === 'user' ? 'user' as const : 'model' as const,
    parts: [{ text: msg.content }]
  }))

  const response = await ai.models.generateContentStream({
    model,
    config: {
      systemInstruction: A2UI_SYSTEM_PROMPT,
      temperature: 0.7,
      maxOutputTokens: 4096
    },
    contents
  })

  const encoder = new TextEncoder()
  return new ReadableStream({
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
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: String(error) })}\n\n`))
        controller.close()
      }
    }
  })
}

// --- OpenAI-compatible streaming (works for OpenAI, etc.) ---
async function streamOpenAI(apiKey: string, model: string, messages: ChatRequest['messages']) {
  const apiMessages = [
    { role: 'system', content: A2UI_SYSTEM_PROMPT },
    ...messages.map(m => ({ role: m.role, content: m.content }))
  ]

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: apiMessages,
      stream: true,
      temperature: 0.7,
      max_tokens: 4096
    })
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenAI API error ${res.status}: ${err}`)
  }

  const reader = res.body!.getReader()
  const decoder = new TextDecoder()
  const encoder = new TextEncoder()

  return new ReadableStream({
    async start(controller) {
      let buffer = ''
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })

          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''

          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed || !trimmed.startsWith('data: ')) continue
            const data = trimmed.slice(6)
            if (data === '[DONE]') continue

            try {
              const parsed = JSON.parse(data)
              const text = parsed.choices?.[0]?.delta?.content ?? ''
              if (text) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
              }
            } catch { /* skip malformed */ }
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      } catch (error) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: String(error) })}\n\n`))
        controller.close()
      }
    }
  })
}

// --- Anthropic streaming ---
async function streamAnthropic(apiKey: string, model: string, messages: ChatRequest['messages']) {
  const apiMessages = messages.map(m => ({
    role: m.role === 'user' ? 'user' : 'assistant',
    content: m.content
  }))

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model,
      system: A2UI_SYSTEM_PROMPT,
      messages: apiMessages,
      stream: true,
      max_tokens: 4096,
      temperature: 0.7
    })
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Anthropic API error ${res.status}: ${err}`)
  }

  const reader = res.body!.getReader()
  const decoder = new TextDecoder()
  const encoder = new TextEncoder()

  return new ReadableStream({
    async start(controller) {
      let buffer = ''
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })

          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''

          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed || !trimmed.startsWith('data: ')) continue
            const data = trimmed.slice(6)

            try {
              const parsed = JSON.parse(data)
              if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: parsed.delta.text })}\n\n`))
              }
            } catch { /* skip */ }
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      } catch (error) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: String(error) })}\n\n`))
        controller.close()
      }
    }
  })
}

export default defineEventHandler(async (event) => {
  const body = await readBody<ChatRequest>(event)

  // Resolve API key: BYOK takes priority, then fall back to server env key (Gemini only)
  const envGeminiKey = process.env.GEMINI_API_KEY || ''
  const effectiveApiKey = body.apiKey?.trim() || (body.provider === 'gemini' ? envGeminiKey : '')

  if (!effectiveApiKey) {
    throw createError({ statusCode: 400, message: 'API key is required. Enter your key in the Playground settings.' })
  }
  if (!body.provider || !['gemini', 'openai', 'anthropic'].includes(body.provider)) {
    throw createError({ statusCode: 400, message: 'Invalid provider. Must be gemini, openai, or anthropic.' })
  }
  if (!body.messages || !Array.isArray(body.messages)) {
    throw createError({ statusCode: 400, message: 'Request body must contain a "messages" array.' })
  }

  // Set SSE headers
  setResponseHeaders(event, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  })

  let stream: ReadableStream

  switch (body.provider) {
    case 'gemini':
      stream = await streamGemini(effectiveApiKey, body.model || 'gemini-2.0-flash', body.messages)
      break
    case 'openai':
      stream = await streamOpenAI(body.apiKey, body.model || 'gpt-4o-mini', body.messages)
      break
    case 'anthropic':
      stream = await streamAnthropic(body.apiKey, body.model || 'claude-sonnet-4-20250514', body.messages)
      break
  }

  return sendStream(event, stream)
})
