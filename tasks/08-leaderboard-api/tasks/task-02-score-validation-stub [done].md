# Task: Add Score Validation Stub [done]

## Goal

Validate submitted scores before persistence exists.

## Scope

- Check numeric values.
- Enforce max score.
- Enforce max elapsed time.
- Return `{ ok: true }` for valid payloads.

## Acceptance Criteria

- Negative scores are rejected.
- Absurdly high scores are rejected.
- Valid payloads are accepted.

## Status

Done as pure validation functions in current MVP. Needs actual HTTP route after Devvit server setup.
