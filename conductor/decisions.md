# Decision Log

Architectural and design decisions made during the A2NUI project.

---

## DEC-001: Vue/Nuxt A2UI Renderer

**Date:** 2026-02-13
**Context:** A2UI protocol ships with Lit (web) and Angular renderers. There is no Vue/Nuxt renderer. DittoDatto runs on Nuxt 4.
**Decision:** Build an inhouse Vue/Nuxt A2UI renderer as a Nuxt module, mapping A2UI catalog components to Nuxt UI components.
**Rationale:** Without a Vue renderer, DittoDatto cannot use A2UI for its agentic AI interfaces. Building this ourselves gives us full control over the rendering pipeline and tight integration with Nuxt UI.

---

## DEC-002: On-Demand Component Transformation

**Date:** 2026-02-13
**Context:** A2NUI needs to bridge Nuxt UI and A2UI protocol. Nuxt UI has 123+ components.
**Decision:** Transform components on-demand based on DittoDatto needs, not all at once.
**Rationale:** Most Nuxt UI components (Page, Blog, Changelog, etc.) are irrelevant to agentic AI interfaces. Priority components: Chat, Table, Form, Input, Select, Button.

---

## DEC-002: Workspace Structure

**Date:** 2026-02-13
**Context:** Need access to Nuxt UI source, docs, and A2UI spec during development.
**Decision:** Workspace contains `A2NUI/` (app), `Nuxt UI Repo/` (source), `Nuxt UI (4.4.0)/` (markdown docs), `A2UI Repo with Docs/` (spec). Markdown docs are the primary reference for component APIs.
**Rationale:** Markdown docs are pre-structured by category and faster to consume than searching the full Nuxt UI source.

---
