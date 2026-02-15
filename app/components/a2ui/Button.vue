<script setup lang="ts">
import type { ResolvedNode } from '~/utils/a2ui/types'

const props = defineProps<{
  node: ResolvedNode
  surfaceId: string
}>()

const label = computed(() => String(props.node.properties.label ?? ''))

const nuxtVariant = computed(() => {
  const v = String(props.node.properties.variant ?? 'primary')
  if (v === 'primary') return 'solid'
  if (v === 'outline') return 'outline'
  if (v === 'ghost' || v === 'borderless') return 'ghost'
  return 'solid'
})
</script>

<template>
  <UButton :label="label" :variant="nuxtVariant" />
</template>
