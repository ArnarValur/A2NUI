<script setup lang="ts">
/**
 * A2NUI Playground — AI Chat with live A2UI rendering
 *
 * Three tabs:
 * 1. Chat — Talk to Gemini, it responds with A2UI surfaces rendered inline
 * 2. Paste — Paste raw JSONL to test renderer directly
 * 3. Inspect — View current surface state and data model
 */
import { useA2uiSurface } from '~/composables/useA2uiSurface'

const genId = () => Math.random().toString(36).slice(2, 12)

useHead({ title: 'A2NUI Playground' })

// --- A2UI Processor ---
const { surfaces, feed, clear: clearSurfaces } = useA2uiSurface()

// --- Chat State ---
interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  surfaces?: string[] // surfaceIds generated in this message
}

const messages = ref<ChatMessage[]>([])
const input = ref('')
const status = ref<'ready' | 'submitted' | 'streaming' | 'error'>('ready')
const errorMessage = ref('')

// --- Paste Tab ---
const pasteInput = ref('')
const pasteSurfaces = ref<string[]>([])

// --- Tab State ---
const activeTab = ref('Chat')
const tabs = [
  { label: 'Chat', value: 'Chat', icon: 'i-lucide-message-circle' },
  { label: 'Paste', value: 'Paste', icon: 'i-lucide-clipboard-paste' },
  { label: 'Inspect', value: 'Inspect', icon: 'i-lucide-search-code' }
]

// --- Chat Logic ---
async function handleSubmit() {
  const text = input.value.trim()
  if (!text || status.value === 'streaming') return

  // Add user message
  const userMsg: ChatMessage = {
    id: genId(),
    role: 'user',
    content: text
  }
  messages.value.push(userMsg)
  input.value = ''
  status.value = 'submitted'

  // Prepare conversation for API
  const apiMessages = messages.value.map(m => ({
    role: m.role,
    content: m.content
  }))

  // Add assistant placeholder
  const assistantMsg: ChatMessage = {
    id: genId(),
    role: 'assistant',
    content: '',
    surfaces: []
  }
  messages.value.push(assistantMsg)

  try {
    const response = await fetch('/api/a2ui/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: apiMessages })
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`)
    }

    status.value = 'streaming'

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    if (!reader) throw new Error('No response body')

    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })

      // Process SSE events
      const events = buffer.split('\n\n')
      buffer = events.pop() ?? '' // Keep incomplete event in buffer

      for (const event of events) {
        const dataLine = event.trim()
        if (!dataLine.startsWith('data: ')) continue

        const data = dataLine.slice(6)
        if (data === '[DONE]') continue

        try {
          const parsed = JSON.parse(data) as { text?: string, error?: string }
          if (parsed.error) {
            console.error('[A2UI Chat] Stream error:', parsed.error)
            continue
          }
          if (parsed.text) {
            assistantMsg.content += parsed.text

            // Try to parse each complete line as A2UI JSONL
            const lines = assistantMsg.content.split('\n')
            for (const line of lines) {
              const trimmed = line.trim()
              if (!trimmed) continue
              try {
                const envelope = JSON.parse(trimmed)
                if (envelope.version === 'v0.10') {
                  feed(trimmed)

                  // Track which surfaces this message created/updated
                  const surfaceId = envelope.createSurface?.surfaceId
                    ?? envelope.updateComponents?.surfaceId
                    ?? envelope.updateDataModel?.surfaceId
                  if (surfaceId && !assistantMsg.surfaces?.includes(surfaceId)) {
                    assistantMsg.surfaces = [...(assistantMsg.surfaces ?? []), surfaceId]
                  }
                }
              } catch {
                // Line not yet complete JSON — expected during streaming
              }
            }
          }
        } catch {
          // Malformed SSE data
        }
      }
    }

    status.value = 'ready'
  } catch (error) {
    console.error('[A2UI Chat] Error:', error)
    status.value = 'error'
    errorMessage.value = String(error)
    assistantMsg.content = `Error: ${error}`
  }
}

// --- Paste Logic ---
function handlePaste() {
  const text = pasteInput.value.trim()
  if (!text) return

  clearSurfaces()
  pasteSurfaces.value = []

  feed(text)

  // Collect surface IDs
  for (const [id] of surfaces.value) {
    if (!pasteSurfaces.value.includes(id)) {
      pasteSurfaces.value.push(id)
    }
  }
}

// --- Nuxt UI Chat message format ---
const chatUiMessages = computed(() => {
  return messages.value.map(msg => ({
    id: msg.id,
    role: msg.role,
    parts: [{ type: 'text' as const, text: msg.role === 'user' ? msg.content : '' }],
    _surfaces: msg.surfaces,
    _rawContent: msg.content
  }))
})
</script>

<template>
  <div class="flex flex-col h-screen">
    <!-- Header -->
    <div class="border-b border-default px-4 py-3 flex items-center gap-3">
      <UIcon name="i-lucide-sparkles" class="text-primary size-5" />
      <h1 class="text-lg font-semibold">A2NUI Playground</h1>
      <UBadge label="v0.10" variant="subtle" size="sm" />
    </div>

    <!-- Tab Navigation -->
    <div class="border-b border-default px-4">
      <UTabs
        v-model="activeTab"
        :items="tabs"
        variant="link"
      />
    </div>

    <!-- Chat Tab -->
    <div v-show="activeTab === 'Chat'" class="flex-1 flex flex-col min-h-0">
      <!-- Messages Area -->
      <div class="flex-1 overflow-y-auto p-4 space-y-4">
        <!-- Empty state -->
        <div v-if="messages.length === 0" class="flex flex-col items-center justify-center h-full text-center gap-4">
          <div class="size-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <UIcon name="i-lucide-sparkles" class="text-primary size-8" />
          </div>
          <div>
            <h2 class="text-xl font-semibold mb-1">A2NUI Playground</h2>
            <p class="text-muted text-sm max-w-md">
              Ask Gemini to build you a UI. It will respond with A2UI JSONL that renders live using Nuxt UI components.
            </p>
          </div>
          <div class="flex flex-wrap gap-2 justify-center max-w-lg">
            <UButton
              v-for="suggestion in [
                'Build me a contact form',
                'Create a settings panel with a volume slider, theme picker, and notifications toggle',
                'Build a user profile card with tabs for Info, Posts, and Settings',
                'Make a booking form with date picker, time selection, and a modal confirmation'
              ]"
              :key="suggestion"
              :label="suggestion"
              variant="outline"
              size="sm"
              @click="input = suggestion"
            />
          </div>
        </div>

        <!-- Messages -->
        <template v-for="msg in messages" :key="msg.id">
          <!-- User message -->
          <div v-if="msg.role === 'user'" class="flex justify-end">
            <div class="bg-primary text-primary-foreground px-4 py-2 rounded-2xl rounded-br-md max-w-[80%]">
              {{ msg.content }}
            </div>
          </div>

          <!-- Assistant message -->
          <div v-else class="flex justify-start">
            <div class="max-w-[90%] space-y-3">
              <!-- Rendered A2UI surfaces -->
              <template v-if="msg.surfaces && msg.surfaces.length > 0">
                <div
                  v-for="surfaceId in msg.surfaces"
                  :key="surfaceId"
                  class="border border-default rounded-xl p-4 bg-default/50"
                >
                  <A2uiRenderer
                    v-if="surfaces.get(surfaceId)"
                    :surface="surfaces.get(surfaceId)!"
                  />
                </div>
              </template>

              <!-- Fallback: raw text if no surfaces -->
              <div
                v-else-if="msg.content && (!msg.surfaces || msg.surfaces.length === 0)"
                class="text-muted text-sm"
              >
                <template v-if="status === 'streaming'">
                  <UIcon name="i-lucide-loader" class="animate-spin size-4" />
                  <span class="ml-2">Generating UI...</span>
                </template>
                <template v-else>
                  {{ msg.content }}
                </template>
              </div>
            </div>
          </div>
        </template>

        <!-- Loading indicator -->
        <div v-if="status === 'submitted'" class="flex justify-start">
          <div class="flex items-center gap-2 text-muted text-sm py-2">
            <UIcon name="i-lucide-loader" class="animate-spin size-4" />
            <span>Thinking...</span>
          </div>
        </div>
      </div>

      <!-- Prompt -->
      <div class="border-t border-default p-4">
        <form class="flex gap-2" @submit.prevent="handleSubmit">
          <UTextarea
            v-model="input"
            placeholder="Ask Gemini to build you a UI..."
            :rows="1"
            autoresize
            class="flex-1"
            @keydown.enter.exact.prevent="handleSubmit"
          />
          <UButton
            type="submit"
            icon="i-lucide-arrow-up"
            :loading="status === 'submitted' || status === 'streaming'"
            :disabled="!input.trim() || status === 'submitted' || status === 'streaming'"
            size="lg"
          />
        </form>
        <p v-if="status === 'error'" class="text-error text-xs mt-2">
          {{ errorMessage }}
        </p>
      </div>
    </div>

    <!-- Paste Tab -->
    <div v-show="activeTab === 'Paste'" class="flex-1 flex flex-col min-h-0">
      <div class="flex-1 flex gap-4 p-4 min-h-0">
        <!-- Input -->
        <div class="flex-1 flex flex-col gap-2 min-h-0">
          <div class="flex items-center justify-between">
            <label class="text-sm font-medium">A2UI JSONL Input</label>
            <UButton label="Render" icon="i-lucide-play" size="sm" @click="handlePaste" />
          </div>
          <UTextarea
            v-model="pasteInput"
            placeholder='Paste A2UI JSONL here... e.g.
{"version":"v0.10","createSurface":{"surfaceId":"demo","catalogId":"standard"}}
{"version":"v0.10","updateComponents":{"surfaceId":"demo","components":[{"id":"root","component":"Column","children":["title"]},{"id":"title","component":"Text","text":"Hello A2NUI!","variant":"h1"}]}}'
            :rows="12"
            class="flex-1 font-mono text-sm"
          />
        </div>

        <!-- Output -->
        <div class="flex-1 flex flex-col gap-2 min-h-0">
          <label class="text-sm font-medium">Rendered Output</label>
          <div class="flex-1 border border-default rounded-xl p-4 overflow-auto bg-default/50">
            <template v-if="pasteSurfaces.length > 0">
              <A2uiRenderer
                v-for="surfaceId in pasteSurfaces"
                :key="surfaceId"
                :surface="surfaces.get(surfaceId)!"
              />
            </template>
            <div v-else class="flex items-center justify-center h-full text-muted text-sm">
              Paste JSONL and click Render to see the output
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Inspect Tab -->
    <div v-show="activeTab === 'Inspect'" class="flex-1 overflow-auto p-4">
      <div v-if="surfaces.size > 0" class="space-y-4">
        <div v-for="[surfaceId, surface] in surfaces" :key="surfaceId">
          <UCard>
            <template #header>
              <div class="flex items-center gap-2">
                <UBadge :label="surfaceId" variant="subtle" />
                <span class="text-sm text-muted">{{ surface.catalogId }}</span>
              </div>
            </template>

            <div class="space-y-3">
              <div>
                <h4 class="text-sm font-medium mb-1">Component Tree</h4>
                <pre class="text-xs bg-elevated rounded-lg p-3 overflow-auto max-h-64">{{ JSON.stringify(surface.rootNode, null, 2) }}</pre>
              </div>

              <USeparator />

              <div>
                <h4 class="text-sm font-medium mb-1">Data Model</h4>
                <pre class="text-xs bg-elevated rounded-lg p-3 overflow-auto max-h-64">{{ JSON.stringify(surface.dataModel, null, 2) }}</pre>
              </div>

              <USeparator />

              <div>
                <h4 class="text-sm font-medium mb-1">Raw Components ({{ surface.components.size }})</h4>
                <pre class="text-xs bg-elevated rounded-lg p-3 overflow-auto max-h-64">{{ JSON.stringify(Object.fromEntries(surface.components), null, 2) }}</pre>
              </div>
            </div>
          </UCard>
        </div>
      </div>
      <div v-else class="flex items-center justify-center h-full text-muted text-sm">
        No surfaces loaded. Use the Chat or Paste tab first.
      </div>
    </div>
  </div>
</template>
