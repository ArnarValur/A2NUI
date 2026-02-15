---
name: A2UI Component Transformation
description: Step-by-step guide for transforming A2UI standard catalog components into Vue/Nuxt UI components
---

# A2UI Component Transformation Skill

This skill guides the transformation of A2UI standard catalog components into Vue components that render using Nuxt UI.

## Prerequisites

Before using this skill, ensure:
- You have read the A2UI v0.10 protocol spec at `A2UI Repo with Docs/specification/v0_10/docs/a2ui_protocol.md`
- The Nuxt UI component markdown docs are available at `Nuxt UI (4.4.0)/Components/`
- The A2UI standard catalog schema is at `A2UI Repo with Docs/specification/v0_10/json/standard_catalog.json`

## Key Reference Files

| Resource | Path |
|----------|------|
| A2UI Protocol Spec | `A2UI Repo with Docs/specification/v0_10/docs/a2ui_protocol.md` |
| Standard Catalog Schema | `A2UI Repo with Docs/specification/v0_10/json/standard_catalog.json` |
| Lit Renderer (reference impl) | `A2UI Repo with Docs/renderers/lit/src/0.8/ui/` |
| web_core Model Processor | `A2UI Repo with Docs/renderers/web_core/src/v0_8/data/model-processor.ts` |
| Nuxt UI Component Docs | `Nuxt UI (4.4.0)/Components/{Category}/{ComponentName}.md` |
| Component Overview | `conductor/component-overview.md` |

## Architecture Overview

```
A2UI JSONL Stream  →  Message Processor  →  Vue Reactive State  →  Component Tree
                      (parse, resolve)        (composable)           (Nuxt UI render)
```

The A2UI protocol defines 18 standard catalog components. Each needs a Vue wrapper that:
1. Receives the resolved A2UI node (type, properties, children)
2. Renders the equivalent Nuxt UI component(s)
3. Handles data binding (read from data model)
4. Handles two-way binding for inputs (write back to data model)
5. Dispatches actions to the server

## A2UI Standard Catalog → Nuxt UI Mapping

| A2UI Component | Nuxt UI Component | Category |
|---|---|---|
| `Text` | Native `<p>`, `<h1>`–`<h5>` (variant-based) | Display |
| `Image` | `<img>` or `<NuxtImg>` | Display |
| `Icon` | `<UIcon>` | Display |
| `Video` | `<video>` | Display |
| `AudioPlayer` | `<audio>` | Display |
| `Row` | `<div class="flex flex-row">` | Layout |
| `Column` | `<div class="flex flex-col">` | Layout |
| `List` | Scrollable `<Column>` | Layout |
| `Card` | `<UCard>` | Layout |
| `Tabs` | `<UTabs>` | Layout |
| `Divider` | `<USeparator>` | Layout |
| `Modal` | `<UModal>` | Overlay |
| `Button` | `<UButton>` | Interactive |
| `CheckBox` | `<UCheckbox>` | Input |
| `TextField` | `<UInput>` / `<UTextarea>` | Input |
| `DateTimeInput` | `<UInputDate>` | Input |
| `ChoicePicker` | `<USelect>` / `<URadioGroup>` | Input |
| `Slider` | `<USlider>` | Input |

## Step-by-Step: Transform a Component

### Step 1: Study the A2UI Component

1. Read the component definition in `standard_catalog.json` — find the `$defs` entry for the component
2. Identify all properties, their types, and which are `Dynamic*` (data-bound)
3. Note any child references (`ComponentId`, `ChildList`)
4. Check the Lit renderer implementation at `renderers/lit/src/0.8/ui/{component}.ts` for behavior reference

### Step 2: Study the Target Nuxt UI Component

1. Read the Nuxt UI markdown docs at `Nuxt UI (4.4.0)/Components/{Category}/{ComponentName}.md`
2. Identify available props, slots, and events
3. Note any capability gaps or extras

### Step 3: Design the Property Mapping

Create a mapping table:

```markdown
| A2UI Prop | Type | Nuxt UI Prop | Transform |
|-----------|------|-------------|-----------|
| text | DynamicString | — (slot content) | Resolve path → render |
| variant | enum | — (element tag) | h1-h5 / p / caption |
| usageHint | string | class | Map to Tailwind classes |
```

### Step 4: Implement the Vue Component

Create `A2NUI/app/components/a2ui/catalog/A2ui{Name}.vue`:

```vue
<template>
  <!-- Nuxt UI component with mapped props -->
</template>

<script setup lang="ts">
import type { ResolvedNode } from '~/utils/a2ui/types'

const props = defineProps<{
  node: ResolvedNode
  surfaceId: string
}>()

// Resolve data-bound properties
// Map to Nuxt UI props
// Handle events/actions
</script>
```

**Key patterns:**
- **Data binding**: Use `processor.getData(node, path)` to resolve `DynamicString` values
- **Two-way binding**: For inputs, call `processor.setData(node, path, newValue)` on change
- **Children**: Use `<A2uiNode>` recursively for child components
- **Actions**: Emit action events up to `<A2uiRenderer>` which sends them to the server

### Step 5: Register in Catalog

Add the component to `app/components/a2ui/catalog/index.ts`:

```typescript
export const catalogComponents: Record<string, Component> = {
  Text: defineAsyncComponent(() => import('./A2uiText.vue')),
  Button: defineAsyncComponent(() => import('./A2uiButton.vue')),
  // ... add new component here
}
```

### Step 6: Test

1. Create a JSONL test case with `createSurface` + `updateComponents` using the component
2. Add test data via `updateDataModel`
3. Verify in the playground page (`/playground`)
4. Test data binding and interactions

### Step 7: Document

Update `conductor/component-overview.md`:
- Change status from ⬜ to ✅
- Fill in the Track column
- Add any notes about gaps or limitations

## Data Binding Cheat Sheet

### Read (Data Model → View)
```typescript
// In a catalog component:
const value = processor.getData(props.node, props.node.properties.text.path)
```

### Write (View → Data Model)
```typescript
// In an input component's @update handler:
processor.setData(props.node, props.node.properties.value.path, newValue)
```

### Path Resolution Rules
- `/absolute/path` → resolves from data model root
- `relative/path` → resolves from node's `dataContextPath`
- Used in template iteration (ChildList with template): each child gets its own `dataContextPath`

## Common Patterns

### Container Components (Row, Column, List)

```vue
<template>
  <div :class="containerClasses">
    <A2uiNode
      v-for="child in node.properties.children"
      :key="child.id"
      :node="child"
      :surface-id="surfaceId"
    />
  </div>
</template>
```

### Input Components (TextField, CheckBox, Slider)

```vue
<template>
  <UInput
    :model-value="resolvedValue"
    @update:model-value="onUpdate"
  />
</template>

<script setup>
const resolvedValue = computed(() => processor.getData(node, valuePath))
function onUpdate(val) {
  processor.setData(node, valuePath, val)
}
</script>
```

### Action Components (Button)

```vue
<template>
  <UButton @click="handleAction">
    <A2uiNode :node="node.properties.child" :surface-id="surfaceId" />
  </UButton>
</template>

<script setup>
function handleAction() {
  emit('a2ui-action', {
    name: node.properties.action.event.name,
    surfaceId: props.surfaceId,
    sourceComponentId: node.id,
    context: resolveContext(node.properties.action.event.context)
  })
}
</script>
```

## New Session Quickstart

When starting a new session to work on A2NUI component transformation:

1. Run `/conductor` to load project context
2. Check `conductor/component-overview.md` for current status
3. Pick a component from the priority list (🔥)
4. Follow **Step-by-Step: Transform a Component** above
5. Run `/checkpoint` before ending the session
