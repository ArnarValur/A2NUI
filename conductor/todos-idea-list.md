# Ideas & Todos Backlog

A space for quick ideas, thoughts, and potential features that don't yet warrant a full track.

---

## 💡 Ideas

<!-- Add ideas below. Format: - [ ] **Idea Title:** Brief description -->

Arnar 14.02.26 01:18 - I wonder what is the range of this A2UI technology, and if we should also do the dashboard layout so we can maybe experiment and test how far we can take this system.

Arnar 14.02.26 02:20 - **Recipes & Templates System** — Predefined JSONL templates (e.g. "Booking Form", "Service Card", "Agent Panel") that the AI populates with data rather than freestyling layout. Same recipe, different content per store/customer. This gives structured flexibility between Customer and Service contexts.

Arnar 14.02.26 02:20 - **Predefined Surface Sizing** — Modal boxes with x,y constraints, form containers with specific dimensions. The recipe defines the _container_, the AI fills the _content_. Could be used to create consistent UI patterns across the platform while remaining flexible.

Arnar 14.02.26 02:20 - **Accessibility by Architecture** — Because A2UI is abstract (component IDs + properties, not HTML), the renderer controls all accessibility. The AI _cannot_ generate inaccessible markup. One JSONL stream → native rendering on web, mobile, screen readers, high-contrast. This could fundamentally change how accessibility works on the internet.

---

## 📝 Quick Todos

<!-- Small tasks that don't belong to any track -->

---

## 🔮 Future Considerations

<!-- Long-term vision items or "someday/maybe" thoughts -->

- [ ] **Recipe Engine** — A system that stores JSONL templates with variable slots, allowing AI to compose from templates rather than generating from scratch. Think of it as "component-level middleware."
- [ ] **Multi-Renderer Testing** — Same JSONL, rendered in both Nuxt UI and Flutter, to prove the cross-platform story for investors/accessibility advocates.
- [ ] **LUI (Living UI) Research Track** — Explore L2-L4 levels where AI adapts not just content but layout and navigation based on context/behavior.

---
