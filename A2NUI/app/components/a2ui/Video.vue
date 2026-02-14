<script setup lang="ts">
/**
 * A2UI Video — Renders a video player.
 * Maps to native <video> element with controls.
 */
import type { ResolvedNode } from "~/utils/a2ui/types";

const props = defineProps<{
  node: ResolvedNode;
  surfaceId: string;
}>();

const url = computed(() => String(props.node.properties.url ?? ""));
</script>

<template>
  <video v-if="url" :src="url" controls class="w-full rounded-lg" />
</template>
