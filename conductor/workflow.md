# Conductor Workflow Guide

## Dev Servers

All services run natively on the host (Linux/Pop!\_OS).

| Service | Port | Start Command |
| ------- | ---- | ------------- |
| A2NUI Dev | 3000 | `cd A2NUI && pnpm dev` |

## Guiding Principles

1. **The Plan is the Source of Truth:** All work must be tracked in `plan.md`
2. **The Tech Stack is Deliberate:** Changes to the tech stack must be documented in `tech-stack.md` _before_ implementation _and_ verified with User.
3. **Protocol Compliance:** All A2UI output must validate against the v0.10 schema.
4. **Phase-Based Commits:** Changes are committed to Git after the completion of each **Phase** (group of tasks) rather than after every individual task.
5. **Task Summaries (Git Notes):** Use **Git Notes** to record detailed task summaries to keep the commit history clean.
6. **Documentation Driven:** Document transformation patterns, gaps, and test prompts alongside each component.

## Component Transformation Workflow

Each component transformation follows this lifecycle:

### 1. Study
- Read the Nuxt UI markdown docs for the component (`Nuxt UI (4.4.0)/Components/{category}/`)
- Understand props, slots, events, and variants
- Identify the component's source in `Nuxt UI Repo/src/` (while available)

### 2. Map
- Identify which A2UI standard catalog components map to this Nuxt UI component
- Document property mappings (Nuxt UI props → A2UI componentProperties)
- Document gaps (features with no A2UI equivalent)
- Check A2UI spec: `A2UI Repo with Docs/specification/v0_10/`

### 3. Prototype
- Create the A2UI wrapper component in `A2NUI/app/components/`
- Implement the renderer that converts A2UI JSONL to the Nuxt UI component

### 4. Test
- Write a Gemini test prompt asking it to generate A2UI JSONL for this component
- Validate the JSONL against the A2UI schema
- Render in the dev app and verify visual output
- Test interactive elements (events flowing back via client-to-server messages)

### 5. Document & Ship
- Update `component-overview.md` status
- Write transformation notes in the track's `spec.md`
- Checkpoint

## Task Workflow

### Standard Task Workflow

1. **Select Task:** Choose the next available task from `plan.md` in sequential order.
2. **Mark In Progress:** Edit `plan.md` and change the task from `[ ]` to `[~]`.
3. **Implementation & Testing:**
   - Implement the feature or fix.
   - Test with Gemini API (flash model).
   - Verify rendering in dev server.
4. **Mark Complete:** Update `plan.md` from `[~]` to `[x]`.

### Phase Completion & Checkpointing Protocol

**Trigger:** Executed after all tasks in a **Phase** are completed.

1. **Announce Phase Completion:** Inform the user that the phase is finished.
2. **Consolidated Commit:**
   - Stage all changes from the phase.
   - Commit with a clear message (e.g., `feat(chat): Complete ChatMessage A2UI transformation`).
3. **Attach Summary (Git Notes):**
   - Create a detailed summary of all tasks in the phase.
   - Attach the summary to the phase commit using `git notes`.
4. **Manual Verification:** Walk through verification steps with the user.
5. **Checkpointing:** Mark the phase as checkpointed in `plan.md`.

## Quality Gates

Before finalizing a phase, verify:

- [ ] A2UI JSONL validates against v0.10 schema
- [ ] Component renders correctly in Nuxt app
- [ ] Interactive elements produce correct client-to-server events
- [ ] Dark/light mode works
- [ ] Documentation (mapping, gaps, test prompt) is complete
- [ ] Code follows project's style guides

## Commit Guidelines

### Message Format

```
<type>(<scope>): <description>
```

### Types

- `feat`: New component transformation or feature
- `fix`: Bug fix
- `docs`: Documentation only
- `refactor`: Code change (no new features/fixes)
- `test`: Adding tests or test prompts
- `chore`: Maintenance
- `conductor`: Conductor-specific setup or plan updates

## Session Management

### Start of Session

Read `pulse.md` for instant context on:
- What was worked on last
- Active tracks and their status
- Recent decisions made
- Suggested next steps

### During Session

- Update track `plan.md` as tasks complete
- Log significant decisions in `decisions.md`

### End of Session

Use `/checkpoint` workflow to:
- Update `pulse.md` with session summary
- Log any decisions made
- Suggest next session focus
- Optionally commit changes

### Quick Reference

| File | Purpose |
| ---- | ------- |
| `pulse.md` | Live project state |
| `tracks.md` | Track list by domain |
| `decisions.md` | Decision log |
| `workflow.md` | This file - conventions |
| `component-overview.md` | Component transformation status |
