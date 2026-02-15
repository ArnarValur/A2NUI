<script setup lang="ts">
import type { ResolvedNode } from '~/utils/a2ui/types'

const props = defineProps<{
  node: ResolvedNode
  surfaceId: string
}>()

const text = computed(() => String(props.node.properties.text ?? ''))
const variant = computed(() => String(props.node.properties.variant ?? 'body'))

const elementMap: Record<string, string> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  body: 'p',
  caption: 'span'
}

const tag = computed(() => elementMap[variant.value] ?? 'p')

const classes = computed(() => {
  const v = variant.value
  if (v === 'h1') return 'text-3xl font-bold tracking-tight'
  if (v === 'h2') return 'text-2xl font-semibold tracking-tight'
  if (v === 'h3') return 'text-xl font-semibold'
  if (v === 'h4') return 'text-lg font-medium'
  if (v === 'h5') return 'text-base font-medium'
  if (v === 'caption') return 'text-sm text-muted'
  return 'text-base'
})
</script>

<template>
  <component :is="tag" :class="classes">
    {{ text }}
  </component>
</template>
