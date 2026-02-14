<script setup lang="ts">
/**
 * A2UI DateTimeInput — Date and/or time input.
 * Maps to native HTML date/time inputs (Nuxt UI doesn't have a date picker in v4.4.0).
 *
 * enableDate + enableTime → datetime-local
 * enableDate only → date
 * enableTime only → time
 * Neither specified → date (default)
 */
import type { ResolvedNode } from "~/utils/a2ui/types";

const props = defineProps<{
  node: ResolvedNode;
  surfaceId: string;
}>();

const label = computed(() => props.node.properties.label as string | undefined);
const enableDate = computed(() => props.node.properties.enableDate !== false);
const enableTime = computed(() => props.node.properties.enableTime === true);
const min = computed(() => props.node.properties.min as string | undefined);
const max = computed(() => props.node.properties.max as string | undefined);

const inputType = computed(() => {
  if (enableDate.value && enableTime.value) return "datetime-local";
  if (enableTime.value && !enableDate.value) return "time";
  return "date";
});

const modelValue = ref(String(props.node.properties.value ?? ""));
</script>

<template>
  <div class="w-full space-y-1">
    <label v-if="label" class="text-sm font-medium text-highlighted">{{
      label
    }}</label>
    <UInput v-model="modelValue" :type="inputType" :min="min" :max="max" />
  </div>
</template>
