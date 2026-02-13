# Product Guidelines: DittoDatto.no

## Brand Identity & Voice

**Name Origin:** "DittoDatto" plays on the Norwegian phrase *"ditt og datt"* ("this and that"). It represents a comprehensive marketplace where you can find everything you need.
**Slogan:** *"Alt mellom ditten og datten finner du på DittoDatto. Prøv gratis, spør hva du trenger."* ("Everything between this and that you'll find on DittoDatto. Try for free, ask for what you need.")

### Personality
The brand strikes a balance between ambitious innovation and relatable Norwegian charm.
*   **Witty & Clever:** We anticipate the quirks of human-AI interaction with a wink. We aren't afraid to be slightly silly to make the tech feel human.
*   **Confident:** We aim to be the "Vipps of Service Booking"—a ubiquitous, trusted utility for the entire nation.
*   **Pragmatic:** Underneath the wit is a rock-solid, reliable system.

### Agent Personas
*   **Ditto (User Agent):** Friendly, Conversational, and Witty. Bridges the gap for non-technical users with warmth and a bit of humor.
*   **Datto (Business Agent):** Efficient, Precise, and Confident. The "Digital Manager" that gets things done without fluff.

## Strategic Principles: "Open Search"

*   **Public Access:** Ditto (User Agent) and Search are completely **FREE** for the public. Unregistered users can query availability (with rate limits).
*   **Data-Driven Sales:** We leverage "Shadow Demand" data (searches with no results) to identify high-demand services/areas and recruit relevant businesses.
*   **Privacy First:** We capture search trends (Keywords + Location) to drive business insights, but strictly anonymize unauthenticated queries to respect GDPR.

## Visual Design Guidelines

### Foundation
*   **Framework:** Nuxt UI (Tailwind CSS based).
*   **Style:** "SaaS Professional" meets "Futuristic Tech."
    *   **Dashboard (Business Portal):** High whitespace, clean lines, and data-dense tables. Prioritizes clarity for management tasks.
    *   **Frontend (Marketplace):** Modern, responsive, and consistent with the "Nuxt" aesthetic.
*   **Theming:**
    *   **Primary Color:** TBD (Currently defaulting to Nuxt Green `#00C58E` as placeholder).
    *   **Modes:** Fully supports Dark Mode (for the "high-tech" feel) and Light Mode (for accessibility/daytime use).

### Interface Principles
1.  **Consistency:** Leverage the shared `packages/ui` library to ensure buttons, inputs, and cards look identical across Admin, Portal, and Marketplace.
2.  **Accessibility:** High contrast text, clear touch targets (for Mobile), and screen-reader friendly structure (supporting our "Marginal Groups" mission).
3.  **Agentic Presence:** Subtle animations or visual cues (e.g., a glowing ring or chat bubble) should indicate when Ditto or Datto is "thinking" or active.

## Code & Structure Conventions

*   **Monorepo Hierarchy:** Strictly adhere to the `apps/*` and `packages/*` separation.
*   **Source of Truth:** All Zod schemas and shared types MUST reside in `packages/shared-types`.
*   **Component Reuse:** UI components used in more than one app MUST be moved to `packages/ui`.