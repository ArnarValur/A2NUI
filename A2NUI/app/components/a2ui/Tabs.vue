<script setup lang="ts">
import type { ResolvedNode } from '~/utils/a2ui/types'

const props = defineProps<{
  node: ResolvedNode
  surfaceId: string
}>()

const tabItems = computed(() => {
  const items = props.node.properties.tabItems as Array<{ title: string, childNode?: ResolvedNode }> | undefined
  if (!items) return []
  return items.map((item, index) => ({
    label: item.title ?? `Tab ${index + 1}`,
    childNode: item.childNode
  }))
})
</script>

<template>
  <UTabs
    :items="tabItems.map(t => ({ label: t.label, value: t.label }))"
  >
    <template #content="{ item }">
      <template v-for="tab in tabItems" :key="tab.label">
        <A2uiNode
          v-if="tab.label === item.label && tab.childNode"
          :node="tab.childNode"
          :surface-id="surfaceId"
        />
      </template>
    </template>
  </UTabs>
</template>
