<script setup lang="ts">
/**
 * A2UI Stepper — Multi-step progress indicator.
 * Maps to Nuxt UI's UStepper.
 *
 * Enables agents to generate guided multi-step workflows:
 * "Step 1: Configure → Step 2: Review → Step 3: Deploy"
 */
import type { ResolvedNode } from '~/utils/a2ui/types'

const props = defineProps<{
  node: ResolvedNode
  surfaceId: string
}>()

const items = computed(() => {
  const raw = props.node.properties.items as Array<Record<string, unknown>> | undefined
  if (!Array.isArray(raw)) return []
  return raw.map((item) => ({
    title: item.title as string | undefined,
    description: item.description as string | undefined,
    icon: item.icon as string | undefined,
    disabled: Boolean(item.disabled)
  }))
})

const color = computed(() => (props.node.properties.color as string) || 'primary')
const size = computed(() => (props.node.properties.size as string) || 'md')
const orientation = computed(() => {
  const o = props.node.properties.orientation as string | undefined
  return o === 'vertical' ? 'vertical' as const : 'horizontal' as const
})
const activeStep = computed(() => {
  const v = props.node.properties.activeStep
  return v != null ? Number(v) : undefined
})
const disabled = computed(() => Boolean(props.node.properties.disabled))
const linear = computed(() => {
  const l = props.node.properties.linear
  return l != null ? Boolean(l) : true
})
</script>

<template>
  <UStepper
    :items="items"
    :color="color as any"
    :size="size as any"
    :orientation="orientation"
    :default-value="activeStep"
    :disabled="disabled"
    :linear="linear"
    class="w-full"
  />
</template>
