<script setup lang="ts">
import type { ResolvedNode } from '~/utils/a2ui/types'

const props = defineProps<{
  node: ResolvedNode
  surfaceId: string
}>()

const title = computed(() => props.node.properties.title as string | undefined)
</script>

<template>
  <UCard>
    <template v-if="title" #header>
      <h3 class="text-lg font-semibold">{{ title }}</h3>
    </template>

    <A2uiNode
      v-for="child in node.children"
      :key="child.id"
      :node="child"
      :surface-id="surfaceId"
    />
  </UCard>
</template>
