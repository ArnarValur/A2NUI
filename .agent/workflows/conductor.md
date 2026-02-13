---
description: Initiate Conductor workflow
---

# 🎵 Conductor Initialization Protocol

When user invokes this workflow (e.g., "Initialize Conductor protocols"), execute the following sequence:

## Phase 1: Load Context

1. Read `conductor/pulse.md` for current project state
2. Read `conductor/tracks.md` for active tracks
3. Read `conductor/agent-profile.md`
3. Note any blockers or urgent items

## Phase 2: Status Report

Present to user:

```
🎵 Conductor Online

📍 Last Session: {date} — {focus}
🔄 Active Tracks: {count}
⚠️ Blockers: {count or "None"}

Quick Status:
{list of active tracks with one-line status}

Ready for orders, Captain. What's our heading?
```

## Phase 3: Await Orders

User may:
- Request track overview → Show detailed track status
- Start work on specific track → Load track plan.md
- Create new track → Invoke `/new-track` workflow
- Ask questions → Provide context-aware answers
- Checkpoint → Invoke `/checkpoint` workflow

---

## Core Files to Ingest

| File | Purpose |
|------|---------|
| `conductor/pulse.md` | Current state, recent decisions, next steps |
| `conductor/tracks.md` | All tracks organized by domain |
| `conductor/workflow.md` | Workflow rules and conventions |
| `conductor/decisions.md` | Past architectural decisions |
| `conductor/agent-profile.md` | Preferred AI agent profile & personality |
| `conductor/product.md` | Product vision and principles |
| `conductor/tech-stack.md` | Technology choices |

---

## Available Workflows

| Command | Description |
|---------|-------------|
| `/new-track` | Create new track with domain selection |
| `/checkpoint` | Save session state, optionally commit |
| `/conductor` | This initialization (re-invoke for refresh) |

---

## Session Behavior

Once initialized, maintain awareness of:
- Current track context
- Domain-specific caution levels (🔴 for functions, 🟡 for types/ui)
- User's preference for Star Trek references 🖖
- Lead developer notification requirement for endpoint changes