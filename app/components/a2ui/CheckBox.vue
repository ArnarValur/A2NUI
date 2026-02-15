<script setup lang="ts">
import type { ResolvedNode } from '~/utils/a2ui/types'

const props = defineProps<{
  node: ResolvedNode
  surfaceId: string
}>()

const label = computed(() => String(props.node.properties.label ?? ''))
const checked = ref(Boolean(props.node.properties.value ?? false))
</script>

<template>
  <UCheckbox v-model="checked" :label="label" />
</template>
