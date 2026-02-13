# Product Guide: A2NUI

## Vision

A2NUI is an experiment/sandbox project to build a **Vue/Nuxt A2UI Renderer** — the missing piece in the A2UI ecosystem. A2UI currently ships renderers for **Lit (web) and Angular only**. There is no Vue/Nuxt support.

We are building this renderer as an **inhouse Nuxt module** for use in DittoDatto.no. It receives A2UI protocol JSONL streams and renders them using Nuxt UI components, giving AI agents the ability to dynamically generate rich Vue UIs.

> **Not public (yet).** This is an internal tool for DittoDatto's agentic AI platform. If it matures, it may become a standalone open-source Nuxt module.

## Mission

Build the **first Vue/Nuxt renderer for the A2UI protocol**, mapping A2UI standard catalog components to Nuxt UI 4.4.0 components. The result: AI agents (Ditto & Datto) can stream UI definitions that render as polished Nuxt UI interfaces in real-time.

## Approach

### On-Demand Transformation
We do NOT transform all 123+ Nuxt UI components. We transform **only the components we need**, driven by actual use cases in DittoDatto:

- **ChatBoxes** — Agent conversational interfaces
- **Tables** — Data display and management
- **Forms** — User input collection
- **Inputs / TextInputs** — Text entry with A2UI bindings
- **Selects / Menus** — Option selection
- **Buttons** — Actions and triggers

### Component Lifecycle
```
Study Nuxt UI Component → Understand A2UI Protocol Mapping → Prototype A2UI Wrapper → Test with Gemini API → Integrate into DittoDatto
```

## Relationship to DittoDatto

A2NUI is a **side-project** supporting DittoDatto's AI agent layer:
- **Ditto** (User Agent) and **Datto** (Business Agent) need rich UI that can be streamed dynamically
- A2UI protocol enables agents to generate UI on-the-fly without hardcoded templates
- Components proven here get promoted to DittoDatto's `packages/ui`

## Key Goals

1. **Working prototypes** — Each transformed component must render correctly via A2UI protocol
2. **Gemini API testing** — Validate that Gemini can generate correct A2UI JSONL for each component
3. **Reusable patterns** — Document transformation patterns so future components are faster
4. **DittoDatto integration path** — Clear upgrade path from sandbox to production