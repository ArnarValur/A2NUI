<script setup lang="ts">
/**
 * A2UI Slideover — Panel that slides in from a screen edge.
 * Maps to Nuxt UI's USlideover component.
 *
 * A2UI properties:
 *   - trigger: ComponentId — the component that opens the slideover
 *   - content: ComponentId — the component inside the slideover
 *   - title: string — optional header title
 *   - description: string — optional header description
 *   - side: 'left' | 'right' | 'top' | 'bottom' — slide direction (default: 'right')
 *
 * The processor resolves trigger/content IDs into
 * triggerNode / contentNode via existing resolution logic.
 */
import type { ResolvedNode } from '~/utils/a2ui/types'

const props = defineProps<{
  node: ResolvedNode
  surfaceId: string
}>()

const isOpen = ref(false)

const triggerNode = computed(
  () =>
    (props.node.properties.entryPointNode as ResolvedNode | undefined) ??
    (props.node.properties.triggerNode as ResolvedNode | undefined),
)

const contentNode = computed(
  () => props.node.properties.contentNode as ResolvedNode | undefined,
)

const title = computed(() => props.node.properties.title as string | undefined)
const description = computed(() => props.node.properties.description as string | undefined)
const side = computed(() => (props.node.properties.side as 'left' | 'right' | 'top' | 'bottom') ?? 'right')
</script>

<template>
  <div>
    <!-- Trigger -->
    <div v-if="triggerNode" @click="isOpen = true" class="cursor-pointer">
      <A2uiNode :node="triggerNode" :surface-id="surfaceId" />
    </div>

    <!-- Slideover -->
    <USlideover v-model:open="isOpen" :title="title" :description="description" :side="side">
      <template #body>
        <A2uiNode
          v-if="contentNode"
          :node="contentNode"
          :surface-id="surfaceId"
        />
      </template>
    </USlideover>
  </div>
</template>
