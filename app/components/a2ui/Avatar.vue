<script setup lang="ts">
/**
 * A2UI Avatar — User/agent identity marker.
 * Maps to Nuxt UI's UAvatar.
 */
import type { ResolvedNode } from '~/utils/a2ui/types'

const props = defineProps<{
  node: ResolvedNode
  surfaceId: string
}>()

const src = computed(() => props.node.properties.src as string | undefined)
const alt = computed(() => (props.node.properties.alt as string) || '')
const size = computed(() => (props.node.properties.size as string) || 'md')
const text = computed(() => props.node.properties.text as string | undefined)
const icon = computed(() => props.node.properties.icon as string | undefined)
</script>

<template>
  <UAvatar
    :src="src"
    :alt="alt"
    :size="size as any"
    :text="text"
    :icon="icon"
  />
</template>
