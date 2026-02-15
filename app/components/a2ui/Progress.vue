<script setup lang="ts">
/**
 * A2UI Progress — Task progress indicator.
 * Maps to Nuxt UI's UProgress.
 */
import type { ResolvedNode } from '~/utils/a2ui/types'

const props = defineProps<{
  node: ResolvedNode
  surfaceId: string
}>()

const value = computed(() => {
  const v = props.node.properties.value
  return v != null ? Number(v) : null
})
const max = computed(() => {
  const m = props.node.properties.max
  if (Array.isArray(m)) return m.map(String)
  return m != null ? Number(m) : undefined
})
const color = computed(() => (props.node.properties.color as string) || 'primary')
const size = computed(() => (props.node.properties.size as string) || 'md')
const status = computed(() => Boolean(props.node.properties.status))
const animation = computed(() => (props.node.properties.animation as string) || 'carousel')
const label = computed(() => props.node.properties.label as string | undefined)
</script>

<template>
  <div class="w-full space-y-1">
    <span v-if="label" class="text-sm font-medium text-highlighted">{{ label }}</span>
    <UProgress
      :model-value="value"
      :max="max as any"
      :color="color as any"
      :size="size as any"
      :status="status"
      :animation="animation as any"
    />
  </div>
</template>
