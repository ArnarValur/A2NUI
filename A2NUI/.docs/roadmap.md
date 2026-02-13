# Roadmap & Suggestions

## Current State (v0.1 — Foundation)

What's working end-to-end:

- [x] A2UI v0.10 JSONL parser + processor (framework-agnostic)
- [x] Vue 3 reactive composable (`useA2uiSurface`)
- [x] 11 catalog components mapped to Nuxt UI
- [x] Gemini API server route with SSE streaming
- [x] Playground with Chat, Paste, and Inspect tabs
- [x] Live streaming render (components appear as Gemini generates them)
- [x] Fallback component for unsupported types

## Next Steps

### Phase 1: Renderer Hardening

**Priority: High** — Make the renderer production-ready.

- [ ] **Fix SSR hydration**: Investigate `reka-ui` ConfigProvider null context issue. May require Nuxt UI update or wrapping playground in `<ClientOnly>`.
- [ ] **Action handling**: Wire button clicks, form submissions, and checkbox toggles back to the composable so they can trigger server events or data model updates.
- [ ] **Data binding**: Test dynamic `$data.path` bindings with `updateDataModel` messages. Support two-way binding for form inputs.
- [ ] **Incremental streaming parser**: Instead of re-parsing all content on each SSE chunk, track the last processed line offset and only parse new lines.
- [ ] **Error boundaries**: Wrap each A2UI component in an error boundary so a single malformed component doesn't crash the entire surface.

### Phase 2: Expanded Component Catalog

**Priority: Medium** — Cover more A2UI component types.

- [ ] **Slider** → `<URange>` — numeric range input
- [ ] **DateTimeInput** → date picker component
- [ ] **MultipleChoice** → `<URadioGroup>` or `<USelect>`
- [ ] **Modal** → `<UModal>` with entry point + content child
- [ ] **List** → virtualized list with template support
- [ ] **AudioPlayer** / **Video** → media playback components
- [ ] **DataTable** → `<UTable>` for tabular data (high value for business portal)
- [ ] **Chart** → chart component (line, bar, pie) for dashboard use cases

### Phase 3: Bidirectional Communication

**Priority: High for AI Dashboard** — Enable the UI to talk back.

- [ ] **Client-to-Server messages**: Implement the A2UI `client_to_server` schema (action triggers, form data, selection events).
- [ ] **WebSocket transport**: Replace SSE with WebSocket for true bidirectional streaming. Enables:
  - Agent pushing updates without user prompt
  - Real-time dashboard data pushes
  - Interactive form validation
- [ ] **Event bus**: Create a composable that emits A2UI events (button clicks, input changes) that can be forwarded to the agent.

### Phase 4: Multi-Surface Management

**Priority: Medium** — Support complex layouts.

- [ ] **Surface positioning**: Allow surfaces to target different UI regions (sidebar, modal, notification area).
- [ ] **Surface lifecycle**: Handle surface creation, updates, and deletion gracefully with transitions.
- [ ] **Surface persistence**: Optionally persist surfaces across page navigation.
- [ ] **Surface stacking**: Z-index and overlay management for notifications/modals.

### Phase 5: Integration with Business Portal

**Priority: High** — The AI Dashboard (see [vision doc](./ai-dashboard-vision.md)).

- [ ] Extract `useA2uiSurface`, processor, and renderer components into a shared package or Nuxt module.
- [ ] Create `<A2uiDashboard>` composite component for the business portal.
- [ ] Integrate with existing auth, company context, and real-time data.
- [ ] Connect to Ditto/Datto agent infrastructure via A2A protocol.

## Suggestions

### 1. Create a Nuxt Module

Extract the A2UI renderer into a proper Nuxt module (`@a2nui/renderer`) that any Nuxt app can install:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["@a2nui/renderer"],
  a2nui: {
    apiKey: process.env.GEMINI_API_KEY,
    defaultModel: "gemini-2.5-flash",
  },
});
```

### 2. System Prompt Library

Build a collection of system prompts optimized for different use cases:

- **Dashboard prompt**: Focuses on data display, charts, KPIs
- **Form prompt**: Focuses on input validation, multi-step forms
- **Notification prompt**: Focuses on alerts, toasts, badges

### 3. Component Theming

The current components use default Nuxt UI styling. Consider:

- Exposing A2UI `style` properties (colors, spacing, border radius)
- Supporting dark/light mode variants in the A2UI spec
- Mapping to your existing theme system (Solar, Moody Blue, etc.)

### 4. Testing Infrastructure

- **Snapshot testing**: Store expected JSONL → rendered HTML pairs
- **Component storybook**: A gallery of all supported components with various props
- **LLM evaluation**: Use the A2UI eval framework from `specification/0_9/eval/` to test Gemini's output quality
