<script setup lang="ts">
/**
 * A2uiRenderer — Renders a resolved A2UI surface as Nuxt UI components.
 * This is the root rendering component that renders the surface's root node.
 */
import type { Surface } from '~/utils/a2ui/types'

const props = defineProps<{
  surface: Surface
}>()

const rootNode = computed(() => props.surface.rootNode)
</script>

<template>
  <div v-if="rootNode" class="a2ui-surface">
    <A2uiNode :node="rootNode" :surface-id="surface.surfaceId" />
  </div>
  <div v-else class="text-muted text-sm italic">
    Waiting for components...
  </div>
</template>
