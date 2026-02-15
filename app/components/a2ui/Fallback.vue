<script setup lang="ts">
import type { ResolvedNode } from '~/utils/a2ui/types'

const props = defineProps<{
  node: ResolvedNode
  surfaceId: string
}>()
</script>

<template>
  <div class="p-3 rounded-lg bg-elevated/50 border border-dashed border-muted text-sm text-muted">
    <span class="font-mono text-xs">{{ node.type }}</span>
    <span class="ml-2 opacity-60">Unsupported component</span>
    <pre class="mt-1 text-xs overflow-auto">{{ JSON.stringify(node.properties, null, 2) }}</pre>
  </div>
</template>
