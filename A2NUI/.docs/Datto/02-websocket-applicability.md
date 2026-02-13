# WebSocket Applicability for the Agent Dashboard

> Is WebSocket the right transport for the Datto → Dashboard channel? An honest analysis.

---

## 1. Current State: SSE

The A2NUI architecture currently uses **SSE (Server-Sent Events)** for the Gemini API → client pipeline:

```
Client → POST /api/a2ui/chat → Server → Gemini API (streaming)
Server → SSE data: events → Client
```

This works for the playground: the client sends a message, the server streams the response. **Unidirectional push, request-response pattern.**

---

## 2. The Question: Does the Dashboard Need WebSocket?

The AI Dashboard (as described in [ai-dashboard-vision.md](file:///media/addinator/Mercury/Libraries/Nuxt/A2NUI/A2NUI/.docs/ai-dashboard-vision.md)) introduces requirements that SSE cannot satisfy alone:

| Requirement                                                         | SSE Can Do It?                                   | WebSocket Can Do It?    |
| ------------------------------------------------------------------- | ------------------------------------------------ | ----------------------- |
| Agent pushes surfaces to client                                     | ✅ Yes                                           | ✅ Yes                  |
| Agent streams token-by-token responses                              | ✅ Yes                                           | ✅ Yes                  |
| Client sends user events back to agent (button clicks, form inputs) | ❌ No (needs separate HTTP POST)                 | ✅ Yes (same channel)   |
| Agent pushes visual pings without client request                    | ❌ Requires polling or long-lived SSE connection | ✅ Yes (native push)    |
| Multiple surfaces updated concurrently                              | ⚠️ Possible but messy                            | ✅ Yes (multiplexed)    |
| Client cancels/interrupts agent processing                          | ❌ No (SSE is one-way)                           | ✅ Yes                  |
| Heartbeat/presence detection                                        | ❌ Manual                                        | ✅ Built-in (ping/pong) |

### The Honest Verdict

**For the playground (what exists now): SSE is sufficient.** The interaction is request-response. The client posts a message, the server streams JSONL back.

**For the dashboard (what's planned): WebSocket is necessary.** The dashboard requires:

1. **Server-initiated push** — Datto watches Firestore and pushes visual pings when events occur (new booking, cancellation). There is no client request triggering these.
2. **Bidirectional events** — When a user clicks a button in an agent-rendered surface, that event must flow back to the agent on the same connection, not via a separate HTTP POST. The A2UI protocol defines client-to-server events (`actionEvent`, `inputEvent`, `submitEvent`) — these need a channel.
3. **Connection lifecycle** — The dashboard is a long-lived view. The user opens it and leaves it open. SSE connections are prone to timeout/reconnect issues over extended periods. WebSocket's ping/pong frames handle this natively.

---

## 3. The Hybrid Pattern

This is not an either/or decision. The industry standard (as practiced by Vercel AI SDK, Anthropic's API, and OpenAI's Realtime API) is:

| Channel                 | Transport          | Use Case                                    |
| ----------------------- | ------------------ | ------------------------------------------- |
| **Chat/Streaming**      | SSE (or WebSocket) | User sends message → agent streams response |
| **Dashboard/Real-time** | WebSocket          | Agent pushes surfaces, pings, data updates  |
| **API/Transactional**   | HTTP REST          | Booking CRUD, payment, auth                 |

For DittoDatto, the recommended pattern is:

```
┌─────────────────────────────────────────────────────────┐
│  Nuxt Application                                       │
│                                                         │
│  Playground (/playground)                               │
│  └── SSE via /api/a2ui/chat   ← Keep as-is             │
│                                                         │
│  Dashboard (/portal/dashboard)                          │
│  └── WebSocket via ws://...   ← New transport           │
│      • Receives A2UI JSONL surfaces                     │
│      • Sends A2UI client-to-server events               │
│      • Receives visual pings                            │
│                                                         │
│  Booking/CRUD (/portal/bookings, /portal/staff)         │
│  └── HTTP REST                ← Keep as-is             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 4. WebSocket in Nuxt — How It Works

Nuxt's server engine (Nitro) runs on top of H3/unjs, which supports WebSocket natively via [CrossWS](https://crossws.unjs.io/):

```ts
// server/routes/_ws.ts (Nitro WebSocket handler)
export default defineWebSocketHandler({
  open(peer) {
    // Connection established
    // Authenticate via token in query params or first message
    // Register this peer for Datto push notifications
  },

  message(peer, message) {
    // Handle A2UI client-to-server events
    // (actionEvent, inputEvent, submitEvent)
    // Route to appropriate handler
  },

  close(peer) {
    // Clean up: unregister from push, release resources
  },
});
```

Client-side composable:

```ts
// composables/useDashboardSocket.ts
export function useDashboardSocket() {
  const surfaces = useA2uiSurface();
  const ws = ref<WebSocket | null>(null);

  function connect(token: string) {
    ws.value = new WebSocket(`wss://${host}/_ws?token=${token}`);

    ws.value.onmessage = (event) => {
      // Feed A2UI JSONL to the existing processor
      surfaces.feed(event.data);
    };
  }

  function sendEvent(event: A2uiClientEvent) {
    ws.value?.send(JSON.stringify(event));
  }

  return { connect, sendEvent, surfaces };
}
```

> [!IMPORTANT]
> The A2UI processor (`processor.ts`) does not care about transport. It accepts JSONL strings and produces surface state. Whether those strings come from SSE or WebSocket is irrelevant to it. This is why the architecture.md separates the "reactivity layer" from the "transport layer."

---

## 5. Where Datto Connects

The WebSocket is the bridge between the Nuxt app and Datto. But **Datto itself doesn't run inside Nuxt** — it runs on MercuryEngine (Hono) or as a Cloud Function.

Two architectures are possible:

### Option A: Direct WebSocket (Datto → Client)

```
Client ←── WebSocket ──→ Datto (MercuryEngine)
```

- Simpler, fewer hops
- Datto must handle WebSocket connections (scaling concern)
- Datto generates A2UI JSONL and pushes directly

### Option B: Nuxt as Proxy (Client ←→ Nuxt ←→ Datto)

```
Client ←── WebSocket ──→ Nuxt Server ←── HTTP/gRPC ──→ Datto
```

- Nuxt handles WebSocket connections (Nitro/CrossWS)
- Nuxt relays between client and Datto
- Datto stays HTTP-only (simpler to scale)
- Nuxt can add auth validation, rate limiting, logging

### Recommendation

**Option B** during development, **Option A** at scale. Reasons:

1. During development, you want the Nuxt dev server to handle everything. One `npm run dev` and the WebSocket works.
2. Nuxt can validate Firebase Auth tokens on the WebSocket handshake before relaying anything to Datto.
3. At scale, you'd likely move Datto behind a Cloud Run service with its own WebSocket support, eliminating the proxy hop.

---

## 6. What About the A2A Protocol?

The A2A protocol (JSON-RPC 2.0) currently defines HTTP POST as its transport. The A2A spec _does_ support streaming via SSE for `tasks/sendSubscribe`.

The WebSocket discussion is about the **A2UI** channel (Datto → Dashboard), not the **A2A** channel (Ditto → Datto). These are separate:

| Channel             | Protocol           | Transport       | Direction        |
| ------------------- | ------------------ | --------------- | ---------------- |
| Ditto → Datto       | A2A (JSON-RPC)     | HTTP POST / SSE | Agent-to-Agent   |
| Datto → Dashboard   | A2UI (JSONL)       | WebSocket       | Agent-to-UI      |
| User → Dashboard    | A2UI client events | WebSocket       | UI-to-Agent      |
| Playground → Gemini | A2UI (JSONL)       | SSE             | Request-Response |

---

## 7. Key Decisions

| Decision                           | Recommendation                        | Rationale                                                          |
| ---------------------------------- | ------------------------------------- | ------------------------------------------------------------------ |
| Keep SSE for playground?           | **Yes**                               | It works, it's simple, no bidirectional need                       |
| Use WebSocket for dashboard?       | **Yes**                               | Visual pings, client events, and long-lived connections require it |
| When to implement?                 | **When dashboard development begins** | No point building the socket before the dashboard surfaces exist   |
| Build in Nuxt (Nitro) or separate? | **Nuxt first**                        | Simpler development, can extract later                             |

---

_This report establishes that WebSocket is the correct transport for the AI Dashboard but is not needed for the existing playground. The A2UI processor is transport-agnostic by design, so the migration is a composable-level change, not an architectural rewrite._
