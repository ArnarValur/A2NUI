<script setup lang="ts">
/**
 * A2UI ScrollArea — Scrollable container for item lists.
 * Maps to Nuxt UI's UScrollArea.
 *
 * A2UI properties:
 *   - items: Array<{ title, description, icon?, status?, meta? }> — data items to display
 *   - orientation: 'vertical' | 'horizontal' — scroll direction (default: vertical)
 *   - height: string — container height CSS class (default: 'h-96')
 *   - virtualize: boolean — enable virtualization for large lists
 *
 * If no items are provided, falls back to rendering children (like List).
 */
import type { ResolvedNode } from '~/utils/a2ui/types'

interface ScrollItem {
  title: string
  description?: string
  icon?: string
  status?: string
  meta?: string
}

const props = defineProps<{
  node: ResolvedNode
  surfaceId: string
}>()

const items = computed(() => {
  const raw = props.node.properties.items as ScrollItem[] | undefined
  if (!Array.isArray(raw)) return []
  return raw.map((item, i) => ({
    id: i,
    title: String(item.title ?? `Item ${i + 1}`),
    description: item.description ? String(item.description) : undefined,
    icon: item.icon as string | undefined,
    status: item.status as string | undefined,
    meta: item.meta as string | undefined
  }))
})

const orientation = computed(
  () => (props.node.properties.orientation as 'vertical' | 'horizontal') ?? 'vertical'
)

const heightClass = computed(
  () => (props.node.properties.height as string) ?? 'h-96'
)

const virtualize = computed(() => !!props.node.properties.virtualize)

const statusColor = (status?: string) => {
  switch (status) {
    case 'confirmed': return 'text-green-500'
    case 'pending': return 'text-amber-500'
    case 'cancelled': return 'text-red-500'
    default: return 'text-muted'
  }
}
</script>

<template>
  <!-- Items mode: render data-driven scroll list -->
  <UScrollArea
    v-if="items.length > 0"
    v-slot="{ item }"
    :items="items"
    :orientation="orientation"
    :virtualize="virtualize ? { estimateSize: 80 } : false"
    :class="['w-full', heightClass]"
  >
    <div class="flex items-start gap-3 px-3 py-2.5 border-b border-default last:border-b-0 hover:bg-elevated/50 transition-colors">
      <UIcon v-if="item.icon" :name="item.icon" class="size-5 mt-0.5 text-muted shrink-0" />
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between gap-2">
          <p class="text-sm font-medium truncate">{{ item.title }}</p>
          <span v-if="item.status" :class="['text-xs font-medium capitalize', statusColor(item.status)]">
            {{ item.status }}
          </span>
        </div>
        <p v-if="item.description" class="text-xs text-muted truncate mt-0.5">{{ item.description }}</p>
        <p v-if="item.meta" class="text-xs text-dimmed mt-0.5">{{ item.meta }}</p>
      </div>
    </div>
  </UScrollArea>

  <!-- Children mode: render child components in a scrollable area -->
  <UScrollArea
    v-else-if="node.children?.length"
    :orientation="orientation"
    :class="['w-full', heightClass]"
    :ui="{ viewport: 'gap-3 p-3' }"
  >
    <A2uiNode
      v-for="child in node.children"
      :key="child.id"
      :node="child"
      :surface-id="surfaceId"
    />
  </UScrollArea>
</template>
