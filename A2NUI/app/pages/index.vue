<script setup lang="ts">
useSeoMeta({
  titleTemplate: '',
  title: 'A2NUI — AI-to-Nuxt UI Component Library',
  ogTitle: 'A2NUI — AI-to-Nuxt UI Component Library',
  description: 'The bridge between AI-generated abstract interfaces and production Nuxt UI components.',
  ogDescription: 'The bridge between AI-generated abstract interfaces and production Nuxt UI components.'
})

// --- Scroll reveal refs ---
const statsRef = ref<HTMLElement>()
const featuresRef = ref<HTMLElement>()
const howItWorksRef = ref<HTMLElement>()
const ctaRef = ref<HTMLElement>()

useScrollReveal(statsRef, { threshold: 0.2 })
useScrollReveal(featuresRef, { threshold: 0.1 })
useScrollReveal(howItWorksRef, { threshold: 0.15 })
useScrollReveal(ctaRef, { threshold: 0.2 })

// --- Animated counters ---
const stat1Ref = ref<HTMLElement>()
const stat2Ref = ref<HTMLElement>()
const stat3Ref = ref<HTMLElement>()

const { display: stat1 } = useCountUp(stat1Ref, 20, { duration: 1800 })
const { display: stat2 } = useCountUp(stat2Ref, 0, { duration: 800 })
const { display: stat3 } = useCountUp(stat3Ref, 10, { duration: 1400, prefix: 'v0.' })
</script>

<template>
  <div>
    <!-- Hero Section -->
    <section class="relative py-24 sm:py-40 overflow-hidden">
      <HeroBackground />
      <UContainer>
        <div class="relative max-w-3xl mx-auto text-center z-10">
          <h1 class="text-5xl sm:text-7xl font-bold tracking-tight hero-entrance">
            <span class="gradient-text">A2N</span><span>UI</span>
            <span class="block text-2xl sm:text-3xl mt-4 font-normal text-muted">Component Library</span>
          </h1>

          <p class="mt-8 text-lg sm:text-xl text-muted leading-relaxed max-w-2xl mx-auto hero-entrance-delayed">
            The bridge between AI-generated abstract interfaces and production Nuxt UI components.
            Every A2UI standard catalog component, rendered natively — ready for the fun.
          </p>

          <div class="mt-12 flex flex-wrap items-center justify-center gap-4 hero-entrance-delayed-2">
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
    <section class="py-16 border-y border-default relative">
      <div class="absolute inset-0 bg-gradient-to-r from-transparent via-primary/3 to-transparent" />
      <UContainer>
        <div
          ref="statsRef"
          class="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center reveal-fade-up"
        >
          <div>
            <div ref="stat1Ref" class="text-4xl font-bold text-primary stat-number">
              {{ stat1 }}
            </div>
            <div class="text-sm text-muted mt-2">Components Implemented</div>
          </div>
          <div>
            <div ref="stat2Ref" class="text-4xl font-bold text-primary stat-number">
              {{ stat2 }}
            </div>
            <div class="text-sm text-muted mt-2">Fallback Renderers</div>
          </div>
          <div>
            <div ref="stat3Ref" class="text-4xl font-bold text-primary stat-number">
              {{ stat3 }}
            </div>
            <div class="text-sm text-muted mt-2">A2UI Protocol Version</div>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- Feature Grid -->
    <section class="py-24">
      <UContainer>
        <div class="text-center mb-16">
          <h2 class="text-3xl sm:text-4xl font-bold">Built for AI-Generated UI</h2>
          <p class="mt-4 text-lg text-muted max-w-2xl mx-auto">
            What the AI generates, you see — instantly. Every component maps to native Nuxt UI widgets.
          </p>
        </div>

        <div
          ref="featuresRef"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children"
        >
          <UCard
            v-for="feature in features"
            :key="feature.title"
            class="glass-card"
          >
            <div class="flex items-start gap-4">
              <div class="shrink-0 w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                <UIcon :name="feature.icon" class="w-5 h-5 text-primary feature-icon" />
              </div>
              <div>
                <h3 class="font-semibold text-highlighted">{{ feature.title }}</h3>
                <p class="mt-1.5 text-sm text-muted leading-relaxed">{{ feature.description }}</p>
              </div>
            </div>
          </UCard>
        </div>
      </UContainer>
    </section>

    <!-- How It Works -->
    <section class="py-24 border-t border-default relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-b from-primary/3 via-transparent to-transparent" />
      <UContainer>
        <div class="text-center mb-16">
          <h2 class="text-3xl sm:text-4xl font-bold">How It Works</h2>
          <p class="mt-4 text-lg text-muted max-w-2xl mx-auto">
            A2UI is a streaming JSONL protocol. The AI generates abstract component trees. A2NUI renders them as native Nuxt UI widgets.
          </p>
        </div>

        <div
          ref="howItWorksRef"
          class="grid grid-cols-1 md:grid-cols-3 gap-8 relative stagger-children"
        >
          <!-- Connecting line (desktop only) -->
          <div class="hidden md:block absolute top-6 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20 z-0" />

          <div
            v-for="(step, i) in steps"
            :key="step.title"
            class="text-center relative z-10"
          >
            <div class="step-circle w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5 ring-1 ring-primary/20">
              <span class="text-lg font-bold text-primary">{{ i + 1 }}</span>
            </div>
            <h3 class="font-semibold text-highlighted mb-2">{{ step.title }}</h3>
            <p class="text-sm text-muted leading-relaxed max-w-xs mx-auto">{{ step.description }}</p>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- CTA -->
    <section class="py-24 border-t border-default relative">
      <div class="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent" />
      <UContainer>
        <div
          ref="ctaRef"
          class="text-center max-w-xl mx-auto reveal-fade-up"
        >
          <h2 class="text-2xl sm:text-3xl font-bold">Ready to explore?</h2>
          <p class="mt-4 text-muted text-lg">
            Dive into the component catalog or try the live playground to see AI-generated UI in action.
          </p>
          <div class="mt-10 flex flex-wrap items-center justify-center gap-4">
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
