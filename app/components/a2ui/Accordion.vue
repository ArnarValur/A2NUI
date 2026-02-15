<script setup lang="ts">
/**
 * A2UI Accordion — Collapsible content panels.
 * Maps to Nuxt UI's UAccordion.
 */
import type { ResolvedNode } from '~/utils/a2ui/types'

const props = defineProps<{
  node: ResolvedNode
  surfaceId: string
}>()

const items = computed(() => {
  const raw = props.node.properties.items as Array<Record<string, unknown>> | undefined
  if (!Array.isArray(raw)) return []
  return raw.map((item, i) => ({
    label: String(item.label ?? `Item ${i + 1}`),
    icon: item.icon as string | undefined,
    content: String(item.content ?? ''),
    disabled: Boolean(item.disabled)
  }))
})

const type = computed(() => {
  const t = props.node.properties.type as string | undefined
  return t === 'multiple' ? 'multiple' as const : 'single' as const
})
</script>

<template>
  <UAccordion :items="items" :type="type" />
</template>
