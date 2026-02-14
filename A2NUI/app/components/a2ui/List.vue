<script setup lang="ts">
/**
 * A2UI List — Scrollable container that arranges children in a direction.
 * Essentially a Column/Row with overflow-auto.
 * Direction defaults to vertical.
 */
import type { ResolvedNode } from "~/utils/a2ui/types";

const props = defineProps<{
  node: ResolvedNode;
  surfaceId: string;
}>();

const direction = computed(
  () => (props.node.properties.direction as string) ?? "vertical",
);
const align = computed(() => props.node.properties.align as string | undefined);

const containerClasses = computed(() => {
  const classes = ["flex", "overflow-auto", "gap-3"];

  // Direction
  if (direction.value === "horizontal") {
    classes.push("flex-row");
  } else {
    classes.push("flex-col");
  }

  // Cross-axis alignment
  if (align.value) {
    const alignMap: Record<string, string> = {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      stretch: "items-stretch",
    };
    if (alignMap[align.value]) classes.push(alignMap[align.value]);
  }

  return classes;
});
</script>

<template>
  <div :class="containerClasses">
    <A2uiNode
      v-for="child in node.children"
      :key="child.id"
      :node="child"
      :surface-id="surfaceId"
    />
  </div>
</template>
