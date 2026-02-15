<script setup lang="ts">
/**
 * A2UI Skeleton — Loading placeholder.
 * Maps to Nuxt UI's USkeleton.
 *
 * The agent can specify shape, width, height, and count to generate
 * placeholder bones that get replaced as content streams in.
 */
import type { ResolvedNode } from '~/utils/a2ui/types'

const props = defineProps<{
  node: ResolvedNode
  surfaceId: string
}>()

const shape = computed(() => (props.node.properties.shape as string) || 'line')
const count = computed(() => {
  const c = props.node.properties.count
  return c != null ? Math.min(Number(c), 10) : 1
})
const width = computed(() => props.node.properties.width as string | undefined)
const height = computed(() => props.node.properties.height as string | undefined)

const skeletonClass = computed(() => {
  const s = shape.value
  const w = width.value
  const h = height.value

  if (s === 'circle') return `h-12 w-12 rounded-full ${w ? `w-[${w}] h-[${w}]` : ''}`
  if (s === 'square') return `h-24 w-24 rounded-lg ${w ? `w-[${w}]` : ''} ${h ? `h-[${h}]` : ''}`
  // Default: line
  return `h-4 ${w ? `w-[${w}]` : 'w-full'} ${h ? `h-[${h}]` : ''}`
})
</script>

<template>
  <div class="space-y-2 w-full">
    <USkeleton v-for="i in count" :key="i" :class="skeletonClass" />
  </div>
</template>
