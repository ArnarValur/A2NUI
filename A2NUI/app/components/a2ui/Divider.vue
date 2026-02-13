<script setup lang="ts">
import type { ResolvedNode } from '~/utils/a2ui/types'

defineProps<{
  node: ResolvedNode
  surfaceId: string
}>()
</script>

<template>
  <USeparator />
</template>
