<script setup lang="ts">
import type { ResolvedNode } from '~/utils/a2ui/types'

const props = defineProps<{
  node: ResolvedNode
  surfaceId: string
}>()

const label = computed(() => String(props.node.properties.label ?? ''))
const placeholder = computed(() => String(props.node.properties.placeholder ?? ''))
const isLongText = computed(() => props.node.properties.variant === 'longText')
const modelValue = ref('')
</script>

<template>
  <div class="w-full space-y-1">
    <label v-if="label" class="text-sm font-medium text-highlighted">{{ label }}</label>
    <UTextarea
      v-if="isLongText"
      v-model="modelValue"
      :placeholder="placeholder"
      autoresize
    />
    <UInput
      v-else
      v-model="modelValue"
      :placeholder="placeholder"
    />
  </div>
</template>
