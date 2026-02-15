<script setup lang="ts">
/**
 * AgentChatPanel — AI agent chat inside DashboardPanel with inline A2UI rendering
 *
 * Demonstrates the convergence of:
 * 1. UDashboardPanel — the host frame (resizable, with header/body/footer slots)
 * 2. Chat interface — message list + prompt input
 * 3. A2uiRenderer — renders A2UI surfaces inline within chat messages
 *
 * In production, swap useAgentChat() for a WebSocket-backed composable.
 */
import { useAgentChat } from '~/composables/useAgentChat'
import { useA2uiSurface } from '~/composables/useA2uiSurface'

const props = withDefaults(defineProps<{
  /** Panel title shown in the header */
  title?: string
  /** Subtitle shown below the title */
  subtitle?: string
  /** Placeholder text for the prompt input */
  placeholder?: string
  /** Whether the panel is resizable */
  resizable?: boolean
  /** Panel id for state persistence */
  panelId?: string
}>(), {
  title: 'AI Assistent',
  subtitle: 'AI Bedriftsassistent',
  placeholder: 'Spør assistenten noe...',
  resizable: false,
  panelId: 'agent-chat'
})

const emit = defineEmits<{
  /** Emitted when a user submits a message */
  (e: 'message', text: string): void
  /** Emitted when the agent creates/updates a surface */
  (e: 'surface', surfaceId: string): void
}>()

// --- A2UI Surface Processor ---
const { surfaces, feed, clear: clearSurfaces } = useA2uiSurface()

// --- Agent Chat (surfaces fed in real-time via callback) ---
const { messages, status, send, clear: clearChat } = useAgentChat({
  onA2uiLine: (line) => {
    feed(line)
  }
})
const input = ref('')

// --- Message handling ---
async function handleSubmit() {
  const text = input.value.trim()
  if (!text) return

  input.value = ''
  emit('message', text)
  await send(text)

  // Emit surface events after response completes
  const lastMsg = messages.value[messages.value.length - 1]
  if (lastMsg?.surfaceIds?.length) {
    for (const sid of lastMsg.surfaceIds) {
      emit('surface', sid)
    }
  }
}

function handleSuggestion(text: string) {
  input.value = text
  nextTick(() => handleSubmit())
}

function handleClear() {
  clearChat()
  clearSurfaces()
}

// --- Scroll management ---
const messagesContainer = ref<HTMLElement>()

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// Auto-scroll when messages change
watch(messages, () => scrollToBottom(), { deep: true })

// --- Suggestion chips ---
const suggestions = [
  'Vis dagens bestillinger',
  'Vis ukens omsetning',
  'Vis ansatte i dag',
  'Hjelp'
]
</script>

<template>
  <UDashboardPanel
    :id="panelId"
    :resizable="resizable"
  >
    <!-- Header -->
    <template #header>
      <div class="flex items-center justify-between w-full px-4 py-3 border-b border-default">
        <div class="flex items-center gap-2.5">
          <div class="size-8 rounded-lg bg-primary/15 flex items-center justify-center">
            <UIcon name="i-lucide-bot" class="text-primary size-4.5" />
          </div>
          <div>
            <h2 class="text-sm font-semibold leading-tight">{{ title }}</h2>
            <p class="text-xs text-muted leading-tight">{{ subtitle }}</p>
          </div>
        </div>
        <div class="flex items-center gap-1">
          <UBadge
            :label="status === 'streaming' ? 'Streamer...' : status === 'submitted' ? 'Tenker...' : 'Klar'"
            :color="status === 'ready' ? 'success' : status === 'error' ? 'error' : 'warning'"
            variant="subtle"
            size="xs"
          />
          <UButton
            icon="i-lucide-trash-2"
            variant="ghost"
            color="neutral"
            size="xs"
            @click="handleClear"
          />
        </div>
      </div>
    </template>

    <!-- Body: Messages -->
    <template #body>
      <div ref="messagesContainer" class="flex flex-col gap-3 h-full overflow-y-auto p-4">
        <!-- Empty state -->
        <div v-if="messages.length === 0" class="flex flex-col items-center justify-center h-full text-center gap-4 py-12">
          <div class="size-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <UIcon name="i-lucide-bot" class="text-primary size-7" />
          </div>
          <div>
            <h3 class="text-base font-semibold mb-1">Hei! Jeg er din {{ title }}.</h3>
            <p class="text-muted text-sm max-w-xs">
              Spør meg om bestillinger, omsetning, personale — jeg svarer med interaktive dashboards.
            </p>
          </div>
          <div class="flex flex-wrap gap-2 justify-center max-w-sm">
            <UButton
              v-for="suggestion in suggestions"
              :key="suggestion"
              :label="suggestion"
              variant="outline"
              size="xs"
              @click="handleSuggestion(suggestion)"
            />
          </div>
        </div>

        <!-- Messages -->
        <template v-for="msg in messages" :key="msg.id">
          <!-- User bubble -->
          <div v-if="msg.role === 'user'" class="flex justify-end">
            <div class="bg-primary text-primary-foreground px-3.5 py-2 rounded-2xl rounded-br-md max-w-[85%] text-sm">
              {{ msg.text }}
            </div>
          </div>

          <!-- Assistant message -->
          <div v-else class="flex justify-start">
            <div class="max-w-[95%] space-y-2">
              <!-- Text part -->
              <div v-if="msg.text" class="text-sm text-default">
                {{ msg.text }}
              </div>

              <!-- A2UI rendered surfaces -->
              <template v-if="msg.surfaceIds.length > 0">
                <div
                  v-for="surfaceId in msg.surfaceIds"
                  :key="surfaceId"
                  class="border border-default rounded-xl p-3 bg-default/30 overflow-x-auto"
                >
                  <A2uiRenderer
                    v-if="surfaces.get(surfaceId)"
                    :surface="surfaces.get(surfaceId)!"
                  />
                  <div v-else class="text-muted text-xs italic flex items-center gap-2">
                    <UIcon name="i-lucide-loader" class="animate-spin size-3.5" />
                    <span>Laster overflate...</span>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </template>

        <!-- Streaming indicator -->
        <div v-if="status === 'submitted'" class="flex items-center gap-2 text-muted text-xs py-1">
          <UIcon name="i-lucide-loader" class="animate-spin size-3.5" />
          <span>Tenker...</span>
        </div>
      </div>
    </template>

    <!-- Footer: Prompt -->
    <template #footer>
      <div class="border-t border-default p-3">
        <form class="flex gap-2" @submit.prevent="handleSubmit">
          <UInput
            v-model="input"
            :placeholder="placeholder"
            class="flex-1"
            size="sm"
            :disabled="status === 'submitted' || status === 'streaming'"
            @keydown.enter.exact.prevent="handleSubmit"
          />
          <UButton
            type="submit"
            icon="i-lucide-send"
            size="sm"
            :loading="status === 'submitted' || status === 'streaming'"
            :disabled="!input.trim() || status === 'submitted' || status === 'streaming'"
          />
        </form>
      </div>
    </template>
  </UDashboardPanel>
</template>
