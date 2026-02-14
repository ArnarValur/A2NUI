<script setup lang="ts">
/**
 * A2UI Modal — Renders a trigger element and modal overlay.
 * Maps to Nuxt UI's UModal component.
 *
 * A2UI v0.10 spec uses:
 *   - trigger: ComponentId — the component that opens the modal
 *   - content: ComponentId — the component inside the modal
 *
 * The processor resolves these into:
 *   - entryPointNode (from entryPointChild or trigger)
 *   - contentNode (from contentChild or content)
 */
import type { ResolvedNode } from "~/utils/a2ui/types";

const props = defineProps<{
  node: ResolvedNode;
  surfaceId: string;
}>();

const isOpen = ref(false);

const triggerNode = computed(
  () =>
    (props.node.properties.entryPointNode as ResolvedNode | undefined) ??
    (props.node.properties.triggerNode as ResolvedNode | undefined),
);

const contentNode = computed(
  () => props.node.properties.contentNode as ResolvedNode | undefined,
);
</script>

<template>
  <div>
    <!-- Trigger -->
    <div v-if="triggerNode" @click="isOpen = true" class="cursor-pointer">
      <A2uiNode :node="triggerNode" :surface-id="surfaceId" />
    </div>

    <!-- Modal -->
    <UModal v-model:open="isOpen">
      <template #content>
        <div class="p-6">
          <A2uiNode
            v-if="contentNode"
            :node="contentNode"
            :surface-id="surfaceId"
          />
        </div>
      </template>
    </UModal>
  </div>
</template>
