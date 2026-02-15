<script setup lang="ts">
/**
 * A2NUI Playground — Multi-Provider AI Chat with live A2UI rendering
 *
 * BYOK (Bring Your Own Key) — supports Gemini, OpenAI, and Anthropic.
 * Three tabs: Chat, Paste, Inspect.
 */
import { useA2uiSurface } from '~/composables/useA2uiSurface'

const genId = () => Math.random().toString(36).slice(2, 12)

useHead({ title: 'A2NUI Playground' })

// --- A2UI Processor ---
const { surfaces, feed, clear: clearSurfaces } = useA2uiSurface()

// --- Gemini-only BYOK Config ---
const geminiModels = [
  { label: 'Gemini 2.0 Flash', value: 'gemini-2.0-flash' },
  { label: 'Gemini 2.5 Flash', value: 'gemini-2.5-flash' },
  { label: 'Gemini 2.5 Flash Lite', value: 'gemini-2.5-flash-lite' },
  { label: 'Gemini 2.5 Pro', value: 'gemini-2.5-pro' },
  { label: 'Gemini 3 Flash', value: 'gemini-3-flash-preview' },
  { label: 'Gemini 3 Pro', value: 'gemini-3-pro-preview' }
]

const selectedModel = ref('gemini-2.0-flash')
const apiKey = ref('')
const settingsOpen = ref(true)
const hasServerKey = ref(false)
const hasApiKey = computed(() => apiKey.value.trim().length > 0 || hasServerKey.value)

// Restore persisted state AFTER hydration to avoid SSR mismatch
onMounted(async () => {
  const savedModel = localStorage.getItem('a2nui-model')
  if (savedModel && geminiModels.some(m => m.value === savedModel)) {
    selectedModel.value = savedModel
  }

  const savedKey = sessionStorage.getItem('a2nui-key')
  if (savedKey) {
    apiKey.value = savedKey
    settingsOpen.value = false
  }

  // Check if server has a Gemini key configured
  try {
    const { hasServerKey: serverKey } = await $fetch<{ hasServerKey: boolean }>('/api/a2ui/status')
    if (serverKey) {
      hasServerKey.value = true
      settingsOpen.value = false
    }
  } catch { /* ignore — BYOK required */ }
})

watch(selectedModel, (m) => {
  if (import.meta.client) localStorage.setItem('a2nui-model', m)
})

watch(apiKey, (k) => {
  if (import.meta.client) {
    if (k.trim()) sessionStorage.setItem('a2nui-key', k)
    else sessionStorage.removeItem('a2nui-key')
  }
})

// --- Chat State ---
interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  surfaces?: string[]
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

// --- Component Sidebar ---
const sidebarOpen = ref(false)

const supportedComponents = [
  { name: 'Accordion', icon: 'i-lucide-chevrons-down-up', category: 'Data' },
  { name: 'Alert', icon: 'i-lucide-alert-triangle', category: 'Element' },
  { name: 'AudioPlayer', icon: 'i-lucide-volume-2', category: 'Media' },
  { name: 'Avatar', icon: 'i-lucide-circle-user', category: 'Element' },
  { name: 'Badge', icon: 'i-lucide-tag', category: 'Element' },
  { name: 'Button', icon: 'i-lucide-mouse-pointer-click', category: 'Element' },
  { name: 'Card', icon: 'i-lucide-credit-card', category: 'Layout' },
  { name: 'Carousel', icon: 'i-lucide-gallery-horizontal', category: 'Data' },
  { name: 'CheckBox', icon: 'i-lucide-square-check', category: 'Form' },
  { name: 'ChoicePicker', icon: 'i-lucide-list', category: 'Form' },
  { name: 'Column', icon: 'i-lucide-columns-2', category: 'Layout' },
  { name: 'DateTimeInput', icon: 'i-lucide-calendar', category: 'Form' },
  { name: 'Divider', icon: 'i-lucide-minus', category: 'Layout' },
  { name: 'Icon', icon: 'i-lucide-shapes', category: 'Element' },
  { name: 'Image', icon: 'i-lucide-image', category: 'Media' },
  { name: 'List', icon: 'i-lucide-list-ordered', category: 'Data' },
  { name: 'Modal', icon: 'i-lucide-app-window', category: 'Overlay' },
  { name: 'Progress', icon: 'i-lucide-loader', category: 'Element' },
  { name: 'Row', icon: 'i-lucide-rows-2', category: 'Layout' },
  { name: 'ScrollArea', icon: 'i-lucide-scroll-text', category: 'Data' },
  { name: 'Slideover', icon: 'i-lucide-panel-right', category: 'Overlay' },
  { name: 'Slider', icon: 'i-lucide-sliders-horizontal', category: 'Form' },
  { name: 'Skeleton', icon: 'i-lucide-bone', category: 'Element' },
  { name: 'Stepper', icon: 'i-lucide-footprints', category: 'Navigation' },
  { name: 'Table', icon: 'i-lucide-table', category: 'Data' },
  { name: 'Tabs', icon: 'i-lucide-panel-top', category: 'Navigation' },
  { name: 'Text', icon: 'i-lucide-type', category: 'Element' },
  { name: 'TextField', icon: 'i-lucide-text-cursor-input', category: 'Form' },
  { name: 'Timeline', icon: 'i-lucide-git-branch', category: 'Data' },
  { name: 'Video', icon: 'i-lucide-video', category: 'Media' }
]

const componentCategories = computed(() => {
  const grouped: Record<string, typeof supportedComponents> = {}
  for (const comp of supportedComponents) {
    if (!grouped[comp.category]) grouped[comp.category] = []
    grouped[comp.category]!.push(comp)
  }
  return grouped
})

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
      body: JSON.stringify({
        provider: 'gemini',
        apiKey: apiKey.value,
        model: selectedModel.value,
        messages: apiMessages
      })
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
  <div class="flex flex-col h-[calc(100vh-var(--header-height,64px))] overflow-hidden">
    <!-- Tab Navigation + Controls -->
    <div class="border-b border-default px-4 flex items-center">
      <UTabs
        v-model="activeTab"
        :items="tabs"
        variant="link"
        class="flex-1"
      />
      <div class="flex items-center gap-2 ml-2">
        <UBadge label="v0.10" variant="subtle" size="sm" />
        <UButton
          :icon="settingsOpen ? 'i-lucide-settings' : 'i-lucide-settings'"
          :color="hasApiKey ? 'neutral' : 'error'"
          :variant="settingsOpen ? 'soft' : 'ghost'"
          size="sm"
          @click="settingsOpen = !settingsOpen"
        />
        <UButton
          :icon="sidebarOpen ? 'i-lucide-panel-right-close' : 'i-lucide-panel-right-open'"
          color="neutral"
          variant="ghost"
          size="sm"
          @click="sidebarOpen = !sidebarOpen"
        />
      </div>
    </div>

    <!-- API Settings Bar -->
    <Transition name="settings">
      <div v-if="settingsOpen" class="border-b border-default px-4 py-2 bg-elevated/50">
        <div class="flex items-center gap-3 flex-wrap">
          <div class="flex items-center gap-2">
            <UIcon name="i-simple-icons-google" class="size-4 text-muted" />
            <span class="text-xs font-medium text-muted">Model</span>
            <USelectMenu
              v-model="selectedModel"
              :items="geminiModels"
              value-key="value"
              class="w-52"
              size="xs"
            />
          </div>
          <div class="flex items-center gap-2 flex-1 min-w-48">
            <span class="text-xs font-medium text-muted whitespace-nowrap">API Key</span>
            <UInput
              v-model="apiKey"
              type="password"
              :placeholder="hasServerKey ? 'Server key active — override with BYOK' : 'Paste your Gemini API key'"
              size="xs"
              class="flex-1"
              :color="hasApiKey ? 'neutral' : 'error'"
            />
          </div>
          <div class="text-xs text-muted">
            <UIcon :name="hasApiKey ? 'i-lucide-check-circle' : 'i-lucide-alert-circle'" :class="hasApiKey ? 'text-green-500' : 'text-red-400'" class="size-3.5" />
          </div>
        </div>
      </div>
    </Transition>

    <!-- Main Content + Sidebar -->
    <div class="flex-1 flex min-h-0">
      <!-- Main Area -->
      <div class="flex-1 flex flex-col min-h-0 min-w-0">
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
                  Ask any LLM to build you a UI. It responds with A2UI JSONL that renders live using Nuxt UI components.
                </p>
                <p v-if="!hasApiKey" class="text-red-400 text-xs mt-2">
                  ⚠ Paste your API key in the settings bar above to get started.
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
                  :disabled="!hasApiKey"
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
                placeholder="Ask Gemini to build a UI..."
                :rows="1"
                autoresize
                class="flex-1"
                @keydown.enter.exact.prevent="handleSubmit"
              />
              <UButton
                type="submit"
                icon="i-lucide-arrow-up"
                :loading="status === 'submitted' || status === 'streaming'"
                :disabled="!input.trim() || !hasApiKey || status === 'submitted' || status === 'streaming'"
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

      <!-- Component Sidebar -->
      <Transition name="sidebar">
        <div
          v-if="sidebarOpen"
          class="w-64 border-l border-default bg-default/50 overflow-y-auto shrink-0"
        >
          <div class="p-3 border-b border-default">
            <div class="flex items-center justify-between">
              <span class="text-sm font-semibold">Supported Components</span>
              <UBadge :label="String(supportedComponents.length)" variant="subtle" size="xs" />
            </div>
          </div>
          <div class="p-2 space-y-3">
            <div v-for="(comps, category) in componentCategories" :key="category">
              <p class="text-xs font-medium text-muted uppercase tracking-wider px-2 mb-1">{{ category }}</p>
              <div class="space-y-0.5">
                <NuxtLink
                  v-for="comp in comps"
                  :key="comp.name"
                  :to="`/components/${comp.name.toLowerCase()}`"
                  class="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-elevated transition-colors"
                >
                  <UIcon :name="comp.icon" class="size-4 text-muted" />
                  <span>{{ comp.name }}</span>
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.sidebar-enter-active,
.sidebar-leave-active {
  transition: width 0.2s ease, opacity 0.2s ease;
  overflow: hidden;
}
.sidebar-enter-from,
.sidebar-leave-to {
  width: 0;
  opacity: 0;
}
.settings-enter-active,
.settings-leave-active {
  transition: max-height 0.2s ease, opacity 0.15s ease;
  overflow: hidden;
  max-height: 60px;
}
.settings-enter-from,
.settings-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
