<script setup lang="ts">
/**
 * A2UI Slider — Range input component.
 * Maps to Nuxt UI's USlider.
 */
import type { ResolvedNode } from "~/utils/a2ui/types";

const props = defineProps<{
  node: ResolvedNode;
  surfaceId: string;
}>();

const label = computed(() => props.node.properties.label as string | undefined);
const min = computed(() => Number(props.node.properties.min ?? 0));
const max = computed(() => Number(props.node.properties.max ?? 100));
const modelValue = ref(Number(props.node.properties.value ?? min.value));
</script>

<template>
  <div class="w-full space-y-2">
    <div v-if="label" class="flex items-center justify-between">
      <label class="text-sm font-medium text-highlighted">{{ label }}</label>
      <span class="text-sm text-muted tabular-nums">{{ modelValue }}</span>
    </div>
    <USlider v-model="modelValue" :min="min" :max="max" />
  </div>
</template>
