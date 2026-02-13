---
description: Create a new Conductor track with domain selection
---

# Create New Track Workflow

## Step 1: Gather Track Information

Ask the user for:
1. **Track name** (e.g., "ChatMessage A2UI Transformation")
2. **Brief description** — What does this track accomplish?

## Step 2: Domain Selection

Present domain options and ask user to select ONE:

| Domain | Path | Description |
|--------|------|-------------|
| `components/form` | `conductor/tracks/components/form/` | Form-related A2UI components (Input, Select, Form, etc.) |
| `components/data` | `conductor/tracks/components/data/` | Data display components (Table, Accordion, etc.) |
| `components/chat` | `conductor/tracks/components/chat/` | AI Chat components (ChatMessage, ChatPrompt, etc.) |
| `components/element` | `conductor/tracks/components/element/` | Basic elements (Button, Badge, Avatar, etc.) |
| `components/navigation` | `conductor/tracks/components/navigation/` | Navigation components (Tabs, Breadcrumb, etc.) |
| `components/overlay` | `conductor/tracks/components/overlay/` | Overlays (Modal, Drawer, Toast, etc.) |
| `components/layout` | `conductor/tracks/components/layout/` | Layout components (Container, Header, etc.) |
| `infrastructure` | `conductor/tracks/infrastructure/` | A2UI protocol integration, tooling, renderers |
| `cross-cutting` | `conductor/tracks/cross-cutting/` | Multi-domain work |

## Step 3: Create Track Folder

Create folder with naming convention:
```
conductor/tracks/{domain}/{snake_case_name}_{YYYYMMDD}/
```

Example: `conductor/tracks/components/chat/chat_message_20260213/`

## Step 4: Generate Files

Create in the new track folder:

### `metadata.json`
```json
{
  "track_id": "{snake_case_name}_{YYYYMMDD}",
  "type": "feature",
  "status": "new",
  "domain": "{domain}",
  "created_at": "{ISO timestamp}",
  "updated_at": "{ISO timestamp}",
  "description": "{user description}"
}
```

### `spec.md`
Document the component transformation specification:
- Source Nuxt UI component (link to markdown docs)
- Target A2UI catalog components
- Property mappings
- Gaps and limitations
- Test prompts

### `plan.md`
Phased implementation plan following the component transformation workflow:
1. Study phase
2. Map phase
3. Prototype phase
4. Test phase
5. Document & Ship phase

### `index.md`
```markdown
# Track {track_id} Context

- [Specification](./spec.md)
- [Implementation Plan](./plan.md)
- [Metadata](./metadata.json)
```

## Step 5: Update Component Overview

Update `conductor/component-overview.md` — change the component's status from ⬜ to 🟡 and fill in the Track column.

## Step 6: Update tracks.md

Add new track entry under the **Active Tracks** section in `conductor/tracks.md`.

## Step 7: Confirm

Tell user: "Track created at `{path}`. Ready to start planning!"