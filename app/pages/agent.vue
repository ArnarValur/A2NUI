<script setup lang="ts">
/**
 * Agent Demo — AgentChatPanel in a dashboard layout
 *
 * Shows how a business-portal dashboard page would embed an AI agent,
 * with a sidebar and a main panel containing the chat interface.
 */
useHead({ title: 'Agent Chat Demo — A2NUI' })

const sidebarItems = [
  { label: 'Dashboard', icon: 'i-lucide-layout-dashboard', active: false },
  { label: 'Bestillinger', icon: 'i-lucide-calendar', active: false },
  { label: 'Tjenester', icon: 'i-lucide-scissors', active: false },
  { label: 'Ansatte', icon: 'i-lucide-users', active: false },
  { label: 'Kunder', icon: 'i-lucide-contact', active: false },
  { label: 'Innstillinger', icon: 'i-lucide-settings', active: false }
]

const activeSurfaces = ref<string[]>([])

function handleSurface(surfaceId: string) {
  if (!activeSurfaces.value.includes(surfaceId)) {
    activeSurfaces.value.push(surfaceId)
  }
}
</script>

<template>
  <div class="flex h-screen bg-default">
    <!-- Simulated Dashboard Sidebar -->
    <aside class="w-56 border-r border-default flex flex-col shrink-0">
      <!-- Branding -->
      <div class="px-4 py-4 border-b border-default">
        <div class="flex items-center gap-2">
          <div class="size-8 rounded-lg bg-primary flex items-center justify-center">
            <span class="text-white font-bold text-sm">A</span>
          </div>
          <div>
            <p class="text-sm font-semibold leading-tight">A2NUI Demo</p>
            <p class="text-xs text-muted leading-tight">Bedriftsportal</p>
          </div>
        </div>
      </div>

      <!-- Nav items -->
      <nav class="flex-1 p-2 space-y-0.5">
        <button
          v-for="item in sidebarItems"
          :key="item.label"
          class="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted hover:bg-elevated hover:text-default transition-colors"
          :class="{ 'bg-elevated text-default font-medium': item.active }"
        >
          <UIcon :name="item.icon" class="size-4" />
          {{ item.label }}
        </button>
      </nav>

      <!-- Bottom branding -->
      <div class="p-3 border-t border-default">
        <div class="flex items-center gap-2 text-xs text-muted">
          <UIcon name="i-lucide-bot" class="size-4 text-primary" />
          <span>A2UI Agent v0.10</span>
        </div>
      </div>
    </aside>

    <!-- Main Content: Dashboard Group with Agent Panel -->
    <div class="flex-1 flex min-w-0">
      <UDashboardGroup>
        <!-- Main Dashboard Panel (placeholder) -->
        <UDashboardPanel :default-size="55">
          <template #header>
            <div class="flex items-center gap-3 px-4 py-3 border-b border-default w-full">
              <UIcon name="i-lucide-layout-dashboard" class="text-muted size-4.5" />
              <h1 class="text-sm font-semibold">Dashboard</h1>
            </div>
          </template>
          <template #body>
            <div class="flex flex-col items-center justify-center h-full text-center gap-4 opacity-50">
              <UIcon name="i-lucide-layout-dashboard" class="size-16 text-muted" />
              <div>
                <p class="text-lg font-semibold mb-1">Hoveddashboard</p>
                <p class="text-sm text-muted max-w-sm">
                  Dette panelet viser vanligvis bedriftens KPIer, grafer, og oversikter.
                  Bruk AI-panelet til høyre for å spørre assistenten.
                </p>
              </div>
            </div>
          </template>
        </UDashboardPanel>

        <!-- Agent Chat Panel -->
        <AgentChatPanel
          title="AI Assistent"
          subtitle="A2UI Agent Demo"
          placeholder="Spør assistenten noe..."
          resizable
          panel-id="agent-chat"
          @surface="handleSurface"
        />
      </UDashboardGroup>
    </div>
  </div>
</template>
