<script setup lang="ts">
/**
 * A2UI Alert — Status callout / notification banner.
 * Maps to Nuxt UI's UAlert.
 */
import type { ResolvedNode } from '~/utils/a2ui/types'

const props = defineProps<{
  node: ResolvedNode
  surfaceId: string
}>()

const title = computed(() => props.node.properties.title as string | undefined)
const description = computed(() => props.node.properties.description as string | undefined)
const icon = computed(() => props.node.properties.icon as string | undefined)
const color = computed(() => (props.node.properties.color as string) || 'primary')
const variant = computed(() => (props.node.properties.variant as string) || 'solid')
</script>

<template>
  <UAlert
    :title="title"
    :description="description"
    :icon="icon"
    :color="color as any"
    :variant="variant as any"
  />
</template>
