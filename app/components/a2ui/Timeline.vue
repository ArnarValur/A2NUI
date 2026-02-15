<script setup lang="ts">
/**
 * A2UI Timeline — Sequence of events with dates, titles, and icons.
 * Maps to Nuxt UI's UTimeline.
 */
import type { ResolvedNode } from '~/utils/a2ui/types'

const props = defineProps<{
  node: ResolvedNode
  surfaceId: string
}>()

const items = computed(() => {
  const raw = props.node.properties.items as Array<Record<string, unknown>> | undefined
  if (!Array.isArray(raw)) return []
  return raw.map((item) => ({
    date: item.date as string | undefined,
    title: item.title as string | undefined,
    description: item.description as string | undefined,
    icon: item.icon as string | undefined
  }))
})

const color = computed(() => (props.node.properties.color as string) || 'primary')
const size = computed(() => (props.node.properties.size as string) || 'md')
const activeIndex = computed(() => {
  const v = props.node.properties.activeIndex
  return v != null ? Number(v) : undefined
})
</script>

<template>
  <UTimeline
    :items="items"
    :color="color as any"
    :size="size as any"
    :default-value="activeIndex"
  />
</template>
