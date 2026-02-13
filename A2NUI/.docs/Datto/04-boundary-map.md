# Datto ↔ Nuxt Boundary Map

> The perimeter between the AI agent and the web application — drawn precisely, from first principles.

---

## 1. The Core Question

Where does Datto end and the Nuxt application begin? This question isn't philosophical — it's architectural. Getting the boundary wrong creates coupling that makes both systems fragile. Getting it right means either side can evolve independently.

---

## 2. The Boundary Principle

The boundary is **the protocol**. Not a function call. Not a shared database. Not an imported module.

```
┌──────────────────────┐       ┌──────────────────────────────┐
│                      │       │                              │
│   DATTO              │       │   NUXT APPLICATION           │
│   (Agent World)      │       │   (Rendered World)           │
│                      │       │                              │
│  • Watches Firestore │       │  • Receives A2UI JSONL       │
│  • Computes metrics  │       │  • Parses → processes → tree │
│  • Decides what to   │       │  • Maps to Vue components    │
│    show and when     │       │  • Renders via Nuxt UI       │
│  • Generates A2UI    │       │  • Captures user events      │
│    JSONL surfaces    │       │  • Forwards events back      │
│  • Handles A2A tasks │       │                              │
│  • Speaks JSON-RPC   │       │                              │
│                      │       │                              │
└──────────┬───────────┘       └──────────┬───────────────────┘
           │                              │
           │    ╔══════════════════════╗   │
           └───→║   THE BOUNDARY       ║←──┘
                ║                      ║
                ║  Protocol: A2UI v0.10║
                ║  Format:   JSONL     ║
                ║  Transport: WS / SSE ║
                ║  Direction: Bidir    ║
                ╚══════════════════════╝
```

### What This Means Concretely

| "Belongs to Datto"                                              | "Belongs to Nuxt"                                           | "Belongs to neither (= the protocol)"                                     |
| --------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------- |
| Business logic (slot calculation, holds, bookings)              | Component rendering (Vue templates, CSS, Nuxt UI props)     | A2UI message format (JSONL envelope structure)                            |
| Decision logic (when to push a ping, what KPIs to show)         | Layout management (zones, grid, responsive)                 | A2UI component catalog (what components exist, their required properties) |
| Data access (Firestore reads/writes)                            | User interaction capture (clicks, inputs, form submissions) | A2UI event schema (actionEvent, inputEvent, submitEvent)                  |
| A2A protocol handling (JSON-RPC routing, skill dispatch)        | Auth token validation, session management                   | Transport negotiation (SSE vs WebSocket handshake)                        |
| LLM integration (Gemini for intent parsing, surface generation) | Animation, transitions, theming, accessibility              | Surface lifecycle (create, update, delete semantics)                      |

---

## 3. The Five Boundary Surfaces

There are exactly five "touchpoints" where Datto and the Nuxt app interact. Each is a contract.

### Surface 1: A2UI JSONL (Server → Client)

**What crosses the boundary:** JSONL messages conforming to the A2UI v0.10 spec.

```jsonl
{"version":"v0.10","createSurface":{"surfaceId":"kpi-bookings","catalogId":"standard"}}
{"version":"v0.10","updateComponents":{"surfaceId":"kpi-bookings","components":[...]}}
{"version":"v0.10","updateDataModel":{"surfaceId":"kpi-bookings","contents":{...}}}
{"version":"v0.10","deleteSurface":{"surfaceId":"ping-expired","delete":true}}
```

**Contract:**

- Messages are valid A2UI v0.10 JSONL
- Each message has `version` and exactly one action key
- Components reference IDs that exist in the same message
- `surfaceId` prefixes determine zone routing (convention, not spec)

**Nuxt doesn't care:** Where the JSONL came from. It could be Datto, Gemini, a hardcoded string, or a test fixture. The `processor.ts` is agnostic.

**Datto doesn't care:** How the surface renders. Whether it's Nuxt UI, Material Design, Flutter, or plain HTML. It emits abstract components.

### Surface 2: A2UI Events (Client → Server)

**What crosses the boundary:** Client-to-server event messages.

```json
{
  "version": "v0.10",
  "clientEvent": {
    "surfaceId": "booking-form",
    "componentId": "submit",
    "eventType": "actionEvent",
    "payload": {}
  }
}
```

**Contract:**

- Events reference a valid `surfaceId` and `componentId`
- Event types match the A2UI client-to-server schema
- Payload structure depends on event type (form data, selection, etc.)

**This surface doesn't exist yet in A2NUI.** The roadmap Phase 3 (Bidirectional Communication) addresses this. It's the most critical missing piece for the Dashboard.

### Surface 3: Authentication Handshake

**What crosses the boundary:** Firebase Auth ID token.

```
WebSocket: wss://host/_ws?token=eyJhbG...
   or
HTTP Header: Authorization: Bearer eyJhbG...
```

**Contract:**

- Client provides a valid Firebase ID token
- Server (Nuxt or Datto) validates the token and extracts custom claims (companyId, role)
- No session state — every connection/request is independently authenticated

**This is shared infrastructure**, not Datto-specific. The same token works for existing Nuxt API routes, Business Portal pages, and future Datto WebSocket connections.

### Surface 4: A2A Protocol (Agent → Agent)

**What crosses the boundary:** JSON-RPC 2.0 messages between Ditto and Datto.

```json
POST /a2a
{
  "jsonrpc": "2.0",
  "method": "tasks/send",
  "params": { "message": {...}, "id": "task-uuid" }
}
```

**This boundary does NOT involve the Nuxt app directly.** A2A is agent-to-agent. The Nuxt app consumes A2UI (the rendered output), not A2A (the negotiation protocol).

However, the Nuxt app _may_ relay A2A requests if acting as a proxy (Option B from the WebSocket report). In that case, it's a transparent relay — it doesn't interpret A2A messages, just forwards them.

### Surface 5: Shared Data (Firestore)

**What crosses the boundary:** Both Datto and the Nuxt app's server routes read from the same Firestore database.

```
Firestore
  └── companies/{companyId}
       ├── stores/{storeId}
       │    ├── services/{serviceId}
       │    ├── bookings/{bookingId}
       │    └── holds/{holdId}
       └── staff/{staffId}
```

**This is not a protocol boundary — it's a shared data layer.** Both systems read from it, but they should never write to the same documents simultaneously. The division:

| Writer                    | What It Writes                                              |
| ------------------------- | ----------------------------------------------------------- |
| **Datto / MercuryEngine** | Bookings, holds (via A2A or direct API)                     |
| **Nuxt server routes**    | Company CRUD, staff CRUD, manual bookings (Business Portal) |
| **Firebase triggers**     | Derived data, counters, notifications                       |

> [!WARNING]
> The Firestore layer is the one place where boundaries can blur dangerously. If both Datto and a Nuxt server route can create bookings, you need a single source of truth for the booking logic. Currently, that's MercuryEngine. The Nuxt Business Portal should call MercuryEngine's API for bookings, not write to Firestore directly. This preserves the boundary.

---

## 4. What A2NUI Owns (the Rendering Host Contract)

A2NUI's job is narrowly defined. It is the **rendering host** for the A2UI protocol. Its responsibilities:

| A2NUI Responsibility                  | Implementation        | File                                |
| ------------------------------------- | --------------------- | ----------------------------------- |
| Parse JSONL streams                   | `parseJsonl()`        | `app/utils/a2ui/processor.ts`       |
| Process messages into surface state   | `processMessage()`    | `app/utils/a2ui/processor.ts`       |
| Build component trees from flat lists | `rebuildTree()`       | `app/utils/a2ui/processor.ts`       |
| Resolve data bindings                 | `resolveBindings()`   | `app/utils/a2ui/processor.ts`       |
| Provide Vue reactivity                | `useA2uiSurface()`    | `app/composables/useA2uiSurface.ts` |
| Map abstract types to Vue components  | Explicit import map   | `app/components/a2ui/Node.vue`      |
| Render each component type            | 11 catalog components | `app/components/a2ui/*.vue`         |
| Handle unknown types gracefully       | Fallback display      | `app/components/a2ui/Fallback.vue`  |

**A2NUI does NOT own:**

- Business logic (booking, payment, staff management)
- Data access (Firestore queries)
- Agent intelligence (LLM calls, intent parsing)
- Protocol negotiation (A2A task lifecycle)
- Authentication logic (Firebase Auth)
- Transport management (SSE/WebSocket connection lifecycle — this belongs to the consuming app)

---

## 5. What Datto Owns (the Agent Contract)

Datto's job is also narrowly defined. It is the **business agent** that:

| Datto Responsibility          | Description                                                         |
| ----------------------------- | ------------------------------------------------------------------- |
| Watch business data           | Monitor Firestore for bookings, cancellations, metrics              |
| Compute business intelligence | Calculate KPIs, detect anomalies, forecast trends                   |
| Decide what to show           | Contextual intelligence: time-of-day, business state, user behavior |
| Generate A2UI surfaces        | Produce JSONL that describes the UI the business owner should see   |
| Handle A2A tasks              | Process availability checks, holds, bookings from external agents   |
| Push visual pings             | Real-time notifications for business events                         |
| Respond to user events        | Handle button clicks, form submissions forwarded via A2UI events    |

**Datto does NOT own:**

- How surfaces are rendered (colors, fonts, animations)
- The dashboard layout (zone arrangement, responsive breakpoints)
- Session management (Firebase Auth)
- Payment processing (Vipps — Datto initiates, Vipps executes)
- The public marketplace UI (that's Ditto's domain + traditional Nuxt pages)

---

## 6. The Boundary in Practice: A Visual Ping Flow

Let's trace a complete interaction to see the boundary in action:

```
1. New booking created in Firestore
   └── Datto's watcher triggers (Cloud Function / listener)

2. Datto computes the ping surface
   └── Generates A2UI JSONL:
       {"version":"v0.10","createSurface":{"surfaceId":"ping-1707831234","catalogId":"standard"}}
       {"version":"v0.10","updateComponents":{"surfaceId":"ping-1707831234","components":[
         {"id":"root","component":"Card","children":["content"]},
         {"id":"content","component":"Column","children":["icon","title","detail","action"]},
         {"id":"icon","component":"Icon","icon":"i-heroicons-calendar"},
         {"id":"title","component":"Text","text":"New Booking!","variant":"h3"},
         {"id":"detail","component":"Text","text":"Maria → Haircut → 14:30"},
         {"id":"action","component":"Button","label":"View Details","variant":"outline"}
       ]}}

   ══════════ BOUNDARY CROSSED: Datto → WebSocket → Nuxt ══════════

3. Nuxt WebSocket handler receives the JSONL
   └── Passes to useA2uiSurface.feed()

4. processor.ts processes the messages
   └── Creates surface "ping-1707831234" in the Map
   └── Builds the component tree

5. Dashboard component detects "ping-" prefix
   └── Routes surface to the ping zone
   └── Applies slide-in animation + pulse CSS

6. Renderer.vue renders the tree
   └── Node.vue resolves Card → Card.vue → UCard
   └── Recursively renders Column, Icon, Text, Button

7. User clicks "View Details"
   └── Button.vue emits an event

   ══════════ BOUNDARY CROSSED: Nuxt → WebSocket → Datto ══════════

8. Event forwarded as A2UI client event
   └── {"version":"v0.10","clientEvent":{"surfaceId":"ping-1707831234","componentId":"action","eventType":"actionEvent"}}

9. Datto receives the event
   └── Replaces the ping surface with a detailed booking view
   └── Sends new updateComponents JSONL

   ══════════ BOUNDARY CROSSED: Datto → WebSocket → Nuxt ══════════

10. Nuxt renders the updated surface
    └── Smooth transition from ping card to detail view
```

Every boundary crossing is a JSONL message. No function calls. No shared memory. No imported modules. Pure protocol.

---

## 7. The Non-Negotiable Rules

These rules preserve the boundary and must be enforced as the system grows:

1. **A2NUI never imports from Datto.** No `import { getSlots } from 'datto'`. The only interface is the protocol.

2. **Datto never imports from A2NUI.** No `import { renderSurface } from 'a2nui'`. Datto emits JSONL and forgets about it.

3. **Firestore writes go through MercuryEngine.** The Nuxt Business Portal calls MercuryEngine's HTTP API for booking operations, never writes directly to booking-related Firestore collections. This prevents dual-writer conflicts.

4. **The A2UI processor is framework-agnostic.** Zero Vue imports in `processor.ts`. It takes strings, it produces objects. The Vue reactivity layer (`useA2uiSurface.ts`) wraps it, but the processor itself is portable to React, Flutter, or any other framework.

5. **Transport is pluggable.** The processor doesn't know about SSE or WebSocket. The composable feeds it strings. The transport is a concern of the consuming application, not the protocol engine.

6. **Surface IDs are the routing key.** The dashboard uses `surfaceId` prefixes to route surfaces to zones. This is a UI convention, not a protocol requirement. Datto uses the convention; the Nuxt app enforces it.

---

## 8. Current A2NUI Codebase: Boundary Audit

Checking the current codebase against these rules:

| Rule                                     | Status          | Notes                                                                                                                                                                                                               |
| ---------------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A2NUI never imports from Datto           | ✅ Clean        | No Datto references in the codebase                                                                                                                                                                                 |
| processor.ts is framework-agnostic       | ✅ Clean        | No Vue imports in `app/utils/a2ui/processor.ts`                                                                                                                                                                     |
| Transport is pluggable                   | ✅ Clean        | `useA2uiSurface.feed()` accepts strings, doesn't know about SSE                                                                                                                                                     |
| Gemini server route is Datto-independent | ⚠️ Worth noting | `server/api/a2ui/chat.post.ts` calls Gemini directly. This is the _playground_ path, not the Datto path. When the dashboard connects to Datto, it will be a different transport (WebSocket), not this server route. |
| No shared Firestore writes               | ✅ N/A          | A2NUI doesn't write to Firestore at all currently                                                                                                                                                                   |

**Assessment: The boundary is clean.** A2NUI is correctly positioned as a rendering host with no business logic leakage. The playground's Gemini server route is a convenience for testing, not an architectural coupling.

---

_This report provides the definitive boundary map between Datto (the AI agent) and the Nuxt application (the rendering host). The boundary is the A2UI protocol. Five touchpoints exist, each with a clear contract. The current codebase respects these boundaries._
