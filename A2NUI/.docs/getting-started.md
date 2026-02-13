# Getting Started

## Prerequisites

- **Node.js** 18+ (22.x recommended)
- **pnpm** 10+ (package manager)
- **Gemini API key** — get one at [aistudio.google.com/apikey](https://aistudio.google.com/apikey)

## Installation

```bash
# Navigate to the project
cd A2NUI/A2NUI

# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env

# Edit .env and set your Gemini API key
# GEMINI_API_KEY=your_key_here
```

## Running the Dev Server

```bash
# Start on port 3003 (to avoid conflicts with other services)
NUXT_PORT=3003 pnpm dev
```

Open [http://localhost:3003/playground](http://localhost:3003/playground)

## Playground Tabs

### Chat Tab

Interactive chat with Gemini. Type a prompt like "Build me a signup form" and watch the AI generate A2UI JSONL that renders as live Nuxt UI components.

**Quick start**: Click one of the suggestion buttons:

- "Build me a contact form"
- "Create a user profile card"
- "Show a settings panel with toggles"
- "Make a pricing table with 3 tiers"

### Paste Tab

Test the renderer directly by pasting A2UI JSONL. Useful for:

- Debugging component rendering
- Testing custom JSONL payloads
- Developing new component types

**Example JSONL to paste:**

```jsonl
{"version":"v0.10","createSurface":{"surfaceId":"demo","catalogId":"standard"}}
{"version":"v0.10","updateComponents":{"surfaceId":"demo","components":[{"id":"root","component":"Column","children":["heading","desc","actions"]},{"id":"heading","component":"Text","text":"Welcome!","variant":"h1"},{"id":"desc","component":"Text","text":"This is rendered from raw JSONL.","variant":"body"},{"id":"actions","component":"Row","children":["btn1","btn2"]},{"id":"btn1","component":"Button","label":"Primary","variant":"primary"},{"id":"btn2","component":"Button","label":"Secondary","variant":"outline"}]}}
```

### Inspect Tab

View the internal state of all loaded surfaces:

- **Component Tree**: The resolved node hierarchy
- **Data Model**: Any bound data
- **Raw Components**: The flat component map as received

## Supported Component Types

| A2UI Type   | Nuxt UI Mapping                | Notes                                                       |
| ----------- | ------------------------------ | ----------------------------------------------------------- |
| `Text`      | `<h1>`–`<h5>`, `<p>`, `<span>` | Variant controls element: h1, h2, h3, h4, h5, body, caption |
| `Button`    | `<UButton>`                    | Variants: primary→solid, outline, text→ghost                |
| `TextField` | `<UInput>` / `<UTextarea>`     | Variant "multiline" → textarea; includes label              |
| `CheckBox`  | `<UCheckbox>`                  | Label + boolean value                                       |
| `Image`     | `<img>`                        | URL + optional alt text                                     |
| `Icon`      | `<UIcon>`                      | Any iconify icon name                                       |
| `Row`       | flex-row container             | Horizontal layout, recursive children                       |
| `Column`    | flex-col container             | Vertical layout, recursive children                         |
| `Card`      | `<UCard>`                      | Optional title, recursive children                          |
| `Divider`   | `<USeparator>`                 | Horizontal line                                             |
| `Tabs`      | `<UTabs>`                      | Tab items with child content                                |

## Environment Variables

| Variable         | Required       | Description                           |
| ---------------- | -------------- | ------------------------------------- |
| `GEMINI_API_KEY` | Yes (for Chat) | Google Gemini API key                 |
| `NUXT_PORT`      | No             | Override default port (default: 3000) |

## Known Limitations

1. **SSR**: The playground falls back to CSR due to a minor SSR hydration issue with Nuxt UI v4's reka-ui dependency. Doesn't affect functionality.
2. **Data binding**: Basic `$data.path` resolution is implemented but not deeply tested with complex nested data models.
3. **Actions**: Button `onClick` actions are logged to console but not yet wired to trigger events back to the server.
4. **Streaming re-parse**: During streaming, the entire content is re-parsed on each chunk. Could be optimized with an incremental parser.
