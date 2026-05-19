# Task: Submit Score On Game Over

## Goal

Send score data to the API after a run ends.

## Scope

- Build payload from final game state.
- POST to `/api/score`.
- Fail silently or show non-blocking feedback.

## Acceptance Criteria

- Score submission happens once per game over.
- Restart is not blocked by network failure.
- Payload values match displayed score details.

## Status

Open.
