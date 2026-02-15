<script setup lang="ts">
/**
 * A2UI Carousel — Embla-based image/content carousel.
 * Maps to Nuxt UI's UCarousel.
 *
 * A2UI properties:
 *   - items: Array<string> | Array<{ src, alt?, caption? }> — image URLs or objects
 *   - orientation: 'horizontal' | 'vertical' — scroll direction (default: horizontal)
 *   - arrows: boolean — show prev/next buttons (default: true)
 *   - dots: boolean — show dot indicators (default: false)
 *   - loop: boolean — infinite loop (default: false)
 *   - autoplay: boolean | { delay: number } — auto-advance slides
 *   - columns: number — visible items, maps to basis (default: 1)
 */
import type { ResolvedNode } from '~/utils/a2ui/types'

interface CarouselItem {
  src: string
  alt?: string
  caption?: string
}

const props = defineProps<{
  node: ResolvedNode
  surfaceId: string
}>()

const items = computed(() => {
  const raw = props.node.properties.items
  if (!Array.isArray(raw)) return []
  return raw.map((item: string | CarouselItem, i: number) => {
    if (typeof item === 'string') {
      return { src: item, alt: `Slide ${i + 1}`, caption: undefined }
    }
    return {
      src: String(item.src ?? ''),
      alt: String(item.alt ?? `Slide ${i + 1}`),
      caption: item.caption ? String(item.caption) : undefined
    }
  })
})

const arrows = computed(() => props.node.properties.arrows !== false)
const dots = computed(() => !!props.node.properties.dots)
const loop = computed(() => !!props.node.properties.loop)
const orientation = computed(
  () => (props.node.properties.orientation as 'horizontal' | 'vertical') ?? 'horizontal'
)

const autoplay = computed(() => {
  const raw = props.node.properties.autoplay
  if (!raw) return undefined
  if (typeof raw === 'object' && raw !== null && 'delay' in raw) {
    return raw as { delay: number }
  }
  return { delay: 3000 }
})

const columns = computed(() => {
  const n = Number(props.node.properties.columns)
  if (n && n > 1) return n
  return 1
})

const itemBasis = computed(() => {
  const map: Record<number, string> = {
    1: 'basis-full',
    2: 'basis-1/2',
    3: 'basis-1/3',
    4: 'basis-1/4'
  }
  return map[columns.value] ?? 'basis-full'
})
</script>

<template>
  <UCarousel
    v-if="items.length > 0"
    v-slot="{ item }"
    :items="items"
    :arrows="arrows"
    :dots="dots"
    :loop="loop"
    :orientation="orientation"
    :autoplay="autoplay"
    :ui="{ item: itemBasis }"
    class="w-full"
  >
    <div class="relative">
      <img
        :src="item.src"
        :alt="item.alt"
        class="w-full rounded-lg object-cover"
        loading="lazy"
      >
      <p
        v-if="item.caption"
        class="absolute bottom-0 inset-x-0 bg-black/50 text-white text-xs px-3 py-1.5 rounded-b-lg"
      >
        {{ item.caption }}
      </p>
    </div>
  </UCarousel>
</template>
