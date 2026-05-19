# Task: Submit Score On Game Over [done]

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

Done in current MVP.

## Notes

- Game over builds a final score payload from the frozen game snapshot.
- The score is submitted once per completed run.
- Network failure does not block restart.
- Local Vite mode quietly shows a non-blocking leaderboard unavailable message.
