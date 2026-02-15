<script setup lang="ts">
/**
 * A2UI AudioPlayer — Renders an audio player with optional description.
 * Maps to native <audio> element with controls.
 */
import type { ResolvedNode } from "~/utils/a2ui/types";

const props = defineProps<{
  node: ResolvedNode;
  surfaceId: string;
}>();

const url = computed(() => String(props.node.properties.url ?? ""));
const description = computed(
  () => props.node.properties.description as string | undefined,
);
</script>

<template>
  <div class="space-y-1">
    <p v-if="description" class="text-sm font-medium text-highlighted">
      {{ description }}
    </p>
    <audio v-if="url" :src="url" controls class="w-full" />
  </div>
</template>
