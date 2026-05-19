# Task: Clean Up Offscreen Entities [done]

## Goal

Prevent unbounded entity growth during long sessions.

## Scope

- Remove entities below `GAME_HEIGHT + 80`.
- Keep update loop allocation reasonable.

## Acceptance Criteria

- Entity count remains stable over time.
- Long runs do not degrade performance.

## Status

Done in current MVP.
