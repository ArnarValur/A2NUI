---
description: Session checkpoint
---

# Checkpoint Protocol

Use this workflow to save current session state before ending or switching focus.

## Step 1: Session Summary

Ask the user:

> "Before we checkpoint, what was the main focus of this session?"

Or infer from conversation context.

## Step 2: Update `pulse.md`

Update `A2NUI/conductor/pulse.md` with:

- Last Updated timestamp
- Session focus summary
- Any tracks that changed status
- Decisions made (add to Session Memory section)
- Next session suggestions

## Step 3: Update Decision Log (if applicable)

If any architectural or design decisions were made, add entries to `conductor/decisions.md` using the template format.

## Step 4: Track Status Check

For any tracks worked on:

- Update the track's `plan.md` with completed tasks
- Update `metadata.json` status if changed
- If track completed, ask if it should move to Completed folder

## Step 5: Git Commit (Optional)

Ask user:

> "Would you like to commit these changes now?"

If yes, stage and commit with message:

```
conductor: Checkpoint - {brief summary}
```

## Step 6: Confirm Checkpoint

Tell user:

> "✅ Checkpoint saved. Session state captured in pulse.md."
>
> **Options:**
>
> - Continue with current track
> - Switch to different track
> - End session

---

## Quick Checkpoint (No Prompts)

If user says "quick checkpoint" or "/checkpoint --quick":

- Auto-update pulse.md with conversation context
- Skip confirmation prompts
- Just save state silently