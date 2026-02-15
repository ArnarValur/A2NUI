<script setup lang="ts">
/**
 * A2UI Table — Renders structured tabular data.
 * Maps to Nuxt UI's UTable (TanStack Table).
 *
 * A2UI properties:
 *   - columns: Array<{ key: string, label: string, align?: 'left'|'center'|'right' }>
 *   - rows: Array<Record<string, unknown>> — the table data
 *   - caption: string — optional table caption
 *   - striped: boolean — alternating row colors
 *   - sticky: boolean — sticky header
 *
 * This component generates TanStack column definitions from the
 * simplified A2UI column format, making it easy for LLMs to produce
 * tables without needing to understand TanStack internals.
 */
import type { ResolvedNode } from '~/utils/a2ui/types'

interface A2uiColumn {
  key: string
  label: string
  align?: 'left' | 'center' | 'right'
}

const props = defineProps<{
  node: ResolvedNode
  surfaceId: string
}>()

const columns = computed(() => {
  const raw = props.node.properties.columns as A2uiColumn[] | undefined
  if (!raw?.length) return undefined

  return raw.map((col) => ({
    accessorKey: col.key,
    header: col.label,
    meta: col.align
      ? {
          class: {
            th: `text-${col.align}`,
            td: `text-${col.align}`,
          },
        }
      : undefined,
  }))
})

const rows = computed(() => {
  return (props.node.properties.rows as Record<string, unknown>[]) ?? []
})

const caption = computed(() => props.node.properties.caption as string | undefined)
const sticky = computed(() => !!props.node.properties.sticky)
</script>

<template>
  <div class="w-full">
    <p v-if="caption" class="text-sm text-muted mb-2">{{ caption }}</p>
    <UTable
      :data="rows"
      :columns="columns"
      :sticky="sticky"
      class="w-full"
    />
  </div>
</template>
