<script setup lang="ts">
import type { ResolvedNode } from '~/utils/a2ui/types'

const props = defineProps<{
  node: ResolvedNode
  surfaceId: string
}>()

const icon = computed(() => String(props.node.properties.icon ?? 'i-lucide-circle'))
</script>

<template>
  <UIcon :name="icon" />
</template>
