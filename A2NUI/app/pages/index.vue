<script setup lang="ts">
useSeoMeta({
  titleTemplate: '',
  title: 'A2NUI — AI-to-Nuxt UI Component Library',
  ogTitle: 'A2NUI — AI-to-Nuxt UI Component Library',
  description: 'The bridge between AI-generated abstract interfaces and production Nuxt UI components.',
  ogDescription: 'The bridge between AI-generated abstract interfaces and production Nuxt UI components.'
})
</script>

<template>
  <div>
    <!-- Hero Section -->
    <section class="relative py-20 sm:py-32 overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      <UContainer>
        <div class="relative max-w-3xl mx-auto text-center">
          <h1 class="text-4xl sm:text-6xl font-bold tracking-tight">
            <span class="text-primary">A2N</span><span>UI</span>
            <span class="block text-2xl sm:text-3xl mt-3 font-normal text-muted">Component Library</span>
          </h1>

          <p class="mt-6 text-lg sm:text-xl text-muted leading-relaxed max-w-2xl mx-auto">
            The bridge between AI-generated abstract interfaces and production Nuxt UI components.
            Every A2UI standard catalog component, rendered natively — ready for
            <strong class="text-highlighted">Ditto & Datto</strong>.
          </p>

          <div class="mt-10 flex flex-wrap items-center justify-center gap-4">
            <UButton
              to="/getting-started"
              size="xl"
              trailing-icon="i-lucide-arrow-right"
              label="Get Started"
            />
            <UButton
              to="/playground"
              size="xl"
              color="neutral"
              variant="outline"
              icon="i-lucide-flask-conical"
              label="Open Playground"
            />
          </div>
        </div>
      </UContainer>
    </section>

    <!-- Stats Banner -->
    <section class="py-12 border-y border-default">
      <UContainer>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div>
            <div class="text-3xl font-bold text-primary">18</div>
            <div class="text-sm text-muted mt-1">Components Implemented</div>
          </div>
          <div>
            <div class="text-3xl font-bold text-primary">0</div>
            <div class="text-sm text-muted mt-1">Fallback Renderers</div>
          </div>
          <div>
            <div class="text-3xl font-bold text-primary">v0.10</div>
            <div class="text-sm text-muted mt-1">A2UI Protocol Version</div>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- Feature Grid -->
    <section class="py-20">
      <UContainer>
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold">Built for AI-Generated UI</h2>
          <p class="mt-4 text-lg text-muted max-w-2xl mx-auto">
            What the AI generates, you see — instantly. Every component maps to native Nuxt UI widgets.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <UCard v-for="feature in features" :key="feature.title">
            <div class="flex items-start gap-4">
              <div class="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <UIcon :name="feature.icon" class="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 class="font-semibold text-highlighted">{{ feature.title }}</h3>
                <p class="mt-1 text-sm text-muted">{{ feature.description }}</p>
              </div>
            </div>
          </UCard>
        </div>
      </UContainer>
    </section>

    <!-- How It Works -->
    <section class="py-20 border-t border-default">
      <UContainer>
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold">How It Works</h2>
          <p class="mt-4 text-lg text-muted max-w-2xl mx-auto">
            A2UI is a streaming JSONL protocol. The AI generates abstract component trees. A2NUI renders them as native Nuxt UI widgets.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div v-for="(step, i) in steps" :key="step.title" class="text-center">
            <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <span class="text-lg font-bold text-primary">{{ i + 1 }}</span>
            </div>
            <h3 class="font-semibold text-highlighted">{{ step.title }}</h3>
            <p class="mt-2 text-sm text-muted">{{ step.description }}</p>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- CTA -->
    <section class="py-20 border-t border-default">
      <UContainer>
        <div class="text-center max-w-xl mx-auto">
          <h2 class="text-2xl font-bold">Ready to explore?</h2>
          <p class="mt-4 text-muted">
            Dive into the component catalog or try the live playground to see AI-generated UI in action.
          </p>
          <div class="mt-8 flex flex-wrap items-center justify-center gap-4">
            <UButton
              to="/components"
              size="lg"
              trailing-icon="i-lucide-arrow-right"
              label="Browse Components"
            />
            <UButton
              to="/playground"
              size="lg"
              color="neutral"
              variant="subtle"
              icon="i-lucide-flask-conical"
              label="Open Playground"
            />
          </div>
        </div>
      </UContainer>
    </section>
  </div>
</template>

<script lang="ts">
const features = [
  {
    icon: 'i-lucide-layers',
    title: 'Display Components',
    description: 'Text, Image, Icon, Video, and AudioPlayer — all rendering natively with proper variants and sizing.'
  },
  {
    icon: 'i-lucide-layout-grid',
    title: 'Layout Components',
    description: 'Row, Column, List, Card, Tabs, and Divider — composable containers that the AI uses to structure any interface.'
  },
  {
    icon: 'i-lucide-mouse-pointer-click',
    title: 'Interactive Components',
    description: 'Button, TextField, CheckBox, ChoicePicker, Slider, DateTimeInput, and Modal — every input primitive for forms and settings.'
  },
  {
    icon: 'i-lucide-sparkles',
    title: 'AI-Reactive',
    description: 'Ask the AI to build a UI and watch it render in real-time. The playground streams A2UI JSONL directly from Gemini.'
  },
  {
    icon: 'i-lucide-accessibility',
    title: 'Accessible by Architecture',
    description: 'The AI generates component IDs and properties — never markup. The renderer controls ARIA, keyboard nav, and screen readers.'
  },
  {
    icon: 'i-lucide-puzzle',
    title: 'Recipe-Ready',
    description: 'Predefined JSONL templates that AI fills with real data. Same structure, different content — structured flexibility.'
  }
]

const steps = [
  {
    title: 'AI Generates JSONL',
    description: 'Gemini (or any LLM) outputs A2UI protocol messages — createSurface, updateComponents, updateDataModel.'
  },
  {
    title: 'Processor Builds Tree',
    description: 'The A2UI processor parses messages, resolves children, data bindings, and builds a reactive component tree.'
  },
  {
    title: 'Renderer Shows UI',
    description: 'Each A2UI component maps to a Nuxt UI widget. The tree renders progressively as JSONL streams in.'
  }
]
</script>
