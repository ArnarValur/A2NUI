<script setup lang="ts">
import type { ResolvedNode } from '~/utils/a2ui/types'

const props = defineProps<{
  node: ResolvedNode
  surfaceId: string
}>()

const gap = computed(() => {
  const g = Number(props.node.properties.gap ?? 3)
  return `gap-${g}`
})
</script>

<template>
  <div :class="['flex flex-col', gap]">
    <A2uiNode
      v-for="child in node.children"
      :key="child.id"
      :node="child"
      :surface-id="surfaceId"
    />
  </div>
</template>
