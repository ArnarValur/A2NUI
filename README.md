# A2NUI

A Vue/Nuxt renderer for the [A2UI protocol](https://github.com/nicholasgasior/a2ui) (AI-to-UI). It takes AI-generated JSONL streams and renders them as native [Nuxt UI](https://ui.nuxt.com) components.

> **Status:** Active development — not production-ready. Built as a sandbox for exploring agentic UI patterns. Contributions and forks welcome.

## What it does

- Receives A2UI v0.10 protocol messages (JSONL)
- Maps standard catalog components → Nuxt UI widgets
- Renders progressively as the AI streams

**20 components** currently supported — forms, layout, data display, overlays, media.

## Setup

```bash
pnpm install
cp .env.example .env  # add your Gemini API key
pnpm dev              # http://localhost:3000
```

## Stack

Nuxt 4 · Nuxt UI 3 · TypeScript · Tailwind CSS 4 · A2UI v0.10

## Contributing

Fork it, break it, improve it. PRs and issues are open.

## License

[MIT](LICENSE)
