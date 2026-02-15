<script setup lang="ts">
/**
 * A2UI Badge — Status indicator / tag.
 * Maps to Nuxt UI's UBadge.
 */
import type { ResolvedNode } from '~/utils/a2ui/types'

const props = defineProps<{
  node: ResolvedNode
  surfaceId: string
}>()

const label = computed(() => String(props.node.properties.label ?? ''))
const color = computed(() => (props.node.properties.color as string) || 'primary')
const variant = computed(() => (props.node.properties.variant as string) || 'solid')
const size = computed(() => (props.node.properties.size as string) || 'md')
const icon = computed(() => props.node.properties.icon as string | undefined)
</script>

<template>
  <UBadge
    :label="label"
    :color="color as any"
    :variant="variant as any"
    :size="size as any"
    :icon="icon"
  />
</template>
