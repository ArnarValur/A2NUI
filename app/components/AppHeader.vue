<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')
const { header } = useAppConfig()

// Show Dashboard link only when private layer is loaded
const router = useRouter()
const hasDashboard = computed(() => {
  try {
    const resolved = router.resolve('/dashboard')
    return resolved.matched.length > 0 && !resolved.matched[0]?.path?.includes(':')
  } catch { return false }
})
</script>

<template>
  <UHeader
    :ui="{ center: 'flex-1' }"
    :to="header?.to || '/'"
    class="backdrop-blur-xl bg-default/70! border-b border-primary/10!"
  >
    <UContentSearchButton
      v-if="header?.search"
      :collapsed="false"
      class="w-full"
    />

    <template
      v-if="header?.title"
      #title
    >
      <span class="font-bold group">
        <span class="text-primary transition-all duration-300 group-hover:gradient-text">A2N</span><span>UI</span>
      </span>
    </template>

    <template #right>
      <UButton
        to="/getting-started"
        label="Getting Started"
        icon="i-lucide-book-open"
        color="neutral"
        variant="ghost"
      />

      <UButton
        v-if="hasDashboard"
        to="/dashboard"
        label="Dashboard"
        icon="i-lucide-layout-dashboard"
        color="neutral"
        variant="ghost"
      />

      <UButton
        to="/playground"
        label="Playground"
        icon="i-lucide-flask-conical"
        color="neutral"
        variant="ghost"
      />

      <UContentSearchButton
        v-if="header?.search"
        class="lg:hidden"
      />

      <UColorModeButton v-if="header?.colorMode" />

      <template v-if="header?.links">
        <UButton
          v-for="(link, index) of header.links"
          :key="index"
          v-bind="{ color: 'neutral', variant: 'ghost', ...link }"
        />
      </template>
    </template>

    <template #body>
      <UContentNavigation
        highlight
        :navigation="navigation"
      />
    </template>
  </UHeader>
</template>
