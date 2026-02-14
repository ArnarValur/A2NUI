<script setup lang="ts">
const { footer } = useAppConfig()
</script>

<template>
  <UFooter>
    <template #left>
      <NuxtLink v-if="footer?.creditsLink" :to="footer.creditsLink" target="_blank" class="text-sm text-muted hover:text-highlighted transition-colors">
        {{ footer.credits }}
      </NuxtLink>
      <span v-else>{{ footer.credits }}</span>
    </template>

    <template #right>
      <UColorModeButton v-if="footer?.colorMode" />

      <template v-if="footer?.links">
        <UButton
          v-for="(link, index) of footer?.links"
          :key="index"
          v-bind="{ color: 'neutral', variant: 'ghost', ...link }"
        />
      </template>
    </template>
  </UFooter>
</template>
