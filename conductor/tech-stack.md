# Technology Stack: A2NUI

## Application

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | Nuxt | 4.3.1 |
| **UI Library** | Nuxt UI | 4.4.0 |
| **CSS** | Tailwind CSS | 4.1.18 |
| **Language** | TypeScript | 5.9.3 |
| **Package Manager** | pnpm | 10.29.2 |
| **Linting** | ESLint | 10.0.0 |

## AI & Protocol

| Layer | Technology | Notes |
|-------|-----------|-------|
| **UI Protocol** | A2UI | v0.10 (latest) |
| **AI Model** | Google Gemini | Tier 3 GCP key, use flash models for testing |
| **AI SDK** | Vercel AI SDK | Nuxt UI Chat components are powered by this |

## Reference Repos (Read-Only)

| Repo | Path | Purpose |
|------|------|---------|
| Nuxt UI Source | `Nuxt UI Repo/` | Component source code and tests |
| Nuxt UI Docs | `Nuxt UI (4.4.0)/` | Markdown docs for all components |
| A2UI Repo | `A2UI Repo with Docs/` | Protocol spec, renderers, samples |

## Dev Environment

- **OS:** Linux (Pop!_OS)
- **IDE:** VS Code + Antigravity
- **Dev Server:** `pnpm dev` (Nuxt, default port 3000)
