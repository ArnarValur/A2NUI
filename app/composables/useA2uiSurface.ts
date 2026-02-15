/**
 * useA2uiSurface — Vue composable for processing A2UI v0.10 JSONL messages
 *
 * Wraps the raw processor with Vue reactivity so the component tree
 * re-renders automatically when messages arrive.
 */
import { ref, computed, type Ref, type ComputedRef, triggerRef } from 'vue'
import type { Surface, A2uiEnvelope } from '~/utils/a2ui/types'
import { processMessage, parseJsonl } from '~/utils/a2ui/processor'

export interface UseA2uiSurfaceReturn {
  surfaces: Ref<Map<string, Surface>>
  getSurface: (id: string) => Surface | undefined
  feed: (jsonl: string) => void
  feedMessage: (message: A2uiEnvelope) => void
  clear: () => void
  lastUpdatedSurfaceId: ComputedRef<string | null>
}

export function useA2uiSurface(): UseA2uiSurfaceReturn {
  const surfaces = ref(new Map<string, Surface>()) as Ref<Map<string, Surface>>
  const _lastUpdatedId = ref<string | null>(null)

  function feedMessage(message: A2uiEnvelope): void {
    const updatedId = processMessage(surfaces.value, message)
    if (updatedId) {
      _lastUpdatedId.value = updatedId
      // Trigger Vue reactivity on the surfaces Map
      triggerRef(surfaces)
    }
  }

  function feed(jsonl: string): void {
    const messages = parseJsonl(jsonl)
    for (const msg of messages) {
      feedMessage(msg)
    }
  }

  function getSurface(id: string): Surface | undefined {
    return surfaces.value.get(id)
  }

  function clear(): void {
    surfaces.value.clear()
    _lastUpdatedId.value = null
    triggerRef(surfaces)
  }

  const lastUpdatedSurfaceId = computed(() => _lastUpdatedId.value)

  return {
    surfaces,
    getSurface,
    feed,
    feedMessage,
    clear,
    lastUpdatedSurfaceId
  }
}
