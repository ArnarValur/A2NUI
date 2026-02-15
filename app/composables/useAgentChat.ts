/**
 * useAgentChat — Simulates an AI agent chat session with A2UI responses
 *
 * In production this would connect via WebSocket to a real agent backend.
 * For now, it uses canned responses with simulated streaming to demonstrate
 * the convergence of Chat + A2UI inside DashboardPanel.
 *
 * Each response can include:
 * - Plain text (rendered as chat bubbles)
 * - A2UI JSONL (rendered as interactive components inline)
 */
import { ref, computed } from 'vue'

export interface AgentChatMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
  /** A2UI JSONL lines that this message streamed — processed into surfaces */
  a2uiJsonl: string[]
  /** Surface IDs created/updated by this message */
  surfaceIds: string[]
}

type ChatStatus = 'ready' | 'submitted' | 'streaming' | 'error'

// --- Canned Responses (Norwegian context) ---

interface CannedResponse {
  keywords: string[]
  text: string
  a2ui: string[]
}

const CANNED_RESPONSES: CannedResponse[] = [
  {
    keywords: ['bestilling', 'booking', 'today', 'i dag', 'bookinger'],
    text: 'Her er dagens bestillinger:',
    a2ui: [
      '{"version":"v0.10","createSurface":{"surfaceId":"agent_bookings","catalogId":"standard"}}',
      '{"version":"v0.10","updateComponents":{"surfaceId":"agent_bookings","components":[{"id":"root","component":"Table","columns":[{"key":"time","label":"Tid","align":"left"},{"key":"customer","label":"Kunde","align":"left"},{"key":"service","label":"Tjeneste","align":"left"},{"key":"therapist","label":"Terapeut","align":"left"},{"key":"status","label":"Status","align":"center"}],"rows":[{"time":"09:00","customer":"Astrid Haugen","service":"Dyp vevsmassasje","therapist":"Ingrid Solberg","status":"Bekreftet"},{"time":"10:30","customer":"Lars Eriksen","service":"Sportsmassasje","therapist":"Kari Nordvik","status":"Bekreftet"},{"time":"12:00","customer":"Mette Svendsen","service":"Aromaterapi","therapist":"Ingrid Solberg","status":"Venter"},{"time":"14:00","customer":"Erik Johansen","service":"Dyp vevsmassasje","therapist":"Kari Nordvik","status":"Bekreftet"},{"time":"15:30","customer":"Silje Pedersen","service":"Hot Stone","therapist":"Ingrid Solberg","status":"Kansellert"}]}]}}'
    ]
  },
  {
    keywords: ['omsetning', 'revenue', 'inntekt', 'penger', 'income', 'salg'],
    text: 'Her er ukens omsetning:',
    a2ui: [
      '{"version":"v0.10","createSurface":{"surfaceId":"agent_revenue","catalogId":"standard"}}',
      '{"version":"v0.10","updateComponents":{"surfaceId":"agent_revenue","components":[{"id":"root","component":"Column","children":["stats_row","divider1","breakdown"]},{"id":"stats_row","component":"Row","children":["stat_total","stat_sessions","stat_avg"]},{"id":"stat_total","component":"Card","child":"total_col"},{"id":"total_col","component":"Column","children":["total_label","total_value"]},{"id":"total_label","component":"Text","text":"Total omsetning","variant":"caption"},{"id":"total_value","component":"Text","text":"47.850 NOK","variant":"h2"},{"id":"stat_sessions","component":"Card","child":"sessions_col"},{"id":"sessions_col","component":"Column","children":["sessions_label","sessions_value"]},{"id":"sessions_label","component":"Text","text":"Behandlinger","variant":"caption"},{"id":"sessions_value","component":"Text","text":"34","variant":"h2"},{"id":"stat_avg","component":"Card","child":"avg_col"},{"id":"avg_col","component":"Column","children":["avg_label","avg_value"]},{"id":"avg_label","component":"Text","text":"Snitt per behandling","variant":"caption"},{"id":"avg_value","component":"Text","text":"1.407 NOK","variant":"h2"},{"id":"divider1","component":"Divider"},{"id":"breakdown","component":"Table","columns":[{"key":"service","label":"Tjeneste","align":"left"},{"key":"count","label":"Antall","align":"center"},{"key":"revenue","label":"Inntekt","align":"right"}],"rows":[{"service":"Dyp vevsmassasje","count":"14","revenue":"19.600 NOK"},{"service":"Sportsmassasje","count":"8","revenue":"11.200 NOK"},{"service":"Aromaterapi","count":"6","revenue":"8.400 NOK"},{"service":"Hot Stone","count":"4","revenue":"5.600 NOK"},{"service":"Ansiktsbehandling","count":"2","revenue":"3.050 NOK"}]}]}}'
    ]
  },
  {
    keywords: ['ansatt', 'staff', 'team', 'personal', 'medarbeider'],
    text: 'Her er teamoversikten:',
    a2ui: [
      '{"version":"v0.10","createSurface":{"surfaceId":"agent_staff","catalogId":"standard"}}',
      '{"version":"v0.10","updateComponents":{"surfaceId":"agent_staff","components":[{"id":"root","component":"Column","children":["heading","staff_table"]},{"id":"heading","component":"Text","text":"Ansatte i dag","variant":"h3"},{"id":"staff_table","component":"Table","columns":[{"key":"name","label":"Navn","align":"left"},{"key":"role","label":"Stilling","align":"left"},{"key":"shift","label":"Vakt","align":"center"},{"key":"bookings","label":"Bestillinger","align":"center"}],"rows":[{"name":"Ingrid Solberg","role":"Sjefterapeut","shift":"08:00 – 16:00","bookings":"5"},{"name":"Kari Nordvik","role":"Terapeut","shift":"09:00 – 17:00","bookings":"4"},{"name":"Thomas Berg","role":"Resepsjonist","shift":"08:00 – 16:00","bookings":"—"}]}]}}'
    ]
  },
  {
    keywords: ['hjelp', 'help', 'hva kan du', 'what can you', 'kommando', 'command'],
    text: 'Jeg er din AI-drevne bedriftsassistent. Her er noe av det jeg kan hjelpe med:',
    a2ui: [
      '{"version":"v0.10","createSurface":{"surfaceId":"agent_help","catalogId":"standard"}}',
      '{"version":"v0.10","updateComponents":{"surfaceId":"agent_help","components":[{"id":"root","component":"Column","children":["row1","row2"]},{"id":"row1","component":"Row","children":["card1","card2"]},{"id":"row2","component":"Row","children":["card3","card4"]},{"id":"card1","component":"Card","child":"c1col"},{"id":"c1col","component":"Column","children":["c1icon","c1title","c1desc"]},{"id":"c1icon","component":"Icon","icon":"i-lucide-calendar","size":"lg"},{"id":"c1title","component":"Text","text":"Bestillinger","variant":"h4"},{"id":"c1desc","component":"Text","text":"Vis dagens timeplan, kommende bestillinger, og kanselleringer."},{"id":"card2","component":"Card","child":"c2col"},{"id":"c2col","component":"Column","children":["c2icon","c2title","c2desc"]},{"id":"c2icon","component":"Icon","icon":"i-lucide-chart-bar","size":"lg"},{"id":"c2title","component":"Text","text":"Omsetning","variant":"h4"},{"id":"c2desc","component":"Text","text":"Se ukens inntekter, tjenesteoversikt, og trender."},{"id":"card3","component":"Card","child":"c3col"},{"id":"c3col","component":"Column","children":["c3icon","c3title","c3desc"]},{"id":"c3icon","component":"Icon","icon":"i-lucide-users","size":"lg"},{"id":"c3title","component":"Text","text":"Ansatte","variant":"h4"},{"id":"c3desc","component":"Text","text":"Oversikt over teamet, vakter, og arbeidsbelastning."},{"id":"card4","component":"Card","child":"c4col"},{"id":"c4col","component":"Column","children":["c4icon","c4title","c4desc"]},{"id":"c4icon","component":"Icon","icon":"i-lucide-settings","size":"lg"},{"id":"c4title","component":"Text","text":"Innstillinger","variant":"h4"},{"id":"c4desc","component":"Text","text":"Oppdater bedriftsprofil, tjenester, og åpningstider."}]}}'
    ]
  }
]

const FALLBACK_RESPONSE: CannedResponse = {
  keywords: [],
  text: 'Beklager, jeg forstod ikke helt forespørselen. Prøv å spørre meg om bestillinger, omsetning, ansatte, eller skriv "hjelp" for å se hva jeg kan gjøre.',
  a2ui: []
}

function matchResponse(input: string): CannedResponse {
  const normalized = input.toLowerCase()
  for (const response of CANNED_RESPONSES) {
    if (response.keywords.some(kw => normalized.includes(kw))) {
      return response
    }
  }
  return FALLBACK_RESPONSE
}

function genId(): string {
  return Math.random().toString(36).slice(2, 12)
}

export interface UseAgentChatOptions {
  /**
   * Called each time an A2UI JSONL line is received during streaming.
   * This is the hook for feeding lines into useA2uiSurface() in real-time.
   */
  onA2uiLine?: (line: string) => void
}

export function useAgentChat(options: UseAgentChatOptions = {}) {
  const messages = ref<AgentChatMessage[]>([])
  const status = ref<ChatStatus>('ready')
  const error = ref<string | null>(null)

  /**
   * Send a user message and get a simulated agent response.
   * Simulates streaming with line-by-line delays.
   * A2UI lines are emitted in real-time via onA2uiLine callback.
   */
  async function send(text: string): Promise<void> {
    if (!text.trim() || status.value === 'streaming') return

    // Add user message
    messages.value = [...messages.value, {
      id: genId(),
      role: 'user',
      text: text.trim(),
      a2uiJsonl: [],
      surfaceIds: []
    }]

    status.value = 'submitted'
    error.value = null

    // Find matching canned response
    const response = matchResponse(text)

    // Create assistant message placeholder
    const assistantMsg: AgentChatMessage = {
      id: genId(),
      role: 'assistant',
      text: '',
      a2uiJsonl: [],
      surfaceIds: []
    }
    messages.value = [...messages.value, assistantMsg]

    // Simulate "thinking" delay
    await sleep(600 + Math.random() * 400)
    status.value = 'streaming'

    // Stream text word-by-word
    const words = response.text.split(' ')
    for (const word of words) {
      assistantMsg.text += (assistantMsg.text ? ' ' : '') + word
      messages.value = [...messages.value] // trigger reactivity
      await sleep(30 + Math.random() * 50)
    }

    // Stream A2UI lines with realistic delay
    if (response.a2ui.length > 0) {
      await sleep(200)
      for (const line of response.a2ui) {
        assistantMsg.a2uiJsonl.push(line)

        // Extract surfaceId
        try {
          const parsed = JSON.parse(line)
          const sid = parsed.createSurface?.surfaceId
            ?? parsed.updateComponents?.surfaceId
          if (sid && !assistantMsg.surfaceIds.includes(sid)) {
            assistantMsg.surfaceIds.push(sid)
          }
        } catch { /* skip */ }

        // Feed A2UI line in real-time so surfaces render during streaming
        options.onA2uiLine?.(line)

        messages.value = [...messages.value] // trigger reactivity
        await sleep(100 + Math.random() * 150)
      }
    }

    status.value = 'ready'
  }

  function clear(): void {
    messages.value = []
    status.value = 'ready'
    error.value = null
  }

  return {
    messages: computed(() => messages.value),
    status: computed(() => status.value),
    error: computed(() => error.value),
    send,
    clear
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
