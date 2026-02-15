<script setup lang="ts">
import type { ResolvedNode } from '~/utils/a2ui/types'

const props = defineProps<{
  node: ResolvedNode
  surfaceId: string
}>()

const url = computed(() => String(props.node.properties.url ?? ''))
const alt = computed(() => String(props.node.properties.alt ?? ''))
</script>

<template>
  <img :src="url" :alt="alt" class="max-w-full rounded-lg" />
</template>
