# Task: Playtest Balance Pass [done]

## Goal

Tune the first minute of gameplay.

## Scope

- Play several runs.
- Record rough death times and causes.
- Adjust speed, spawn interval, and pattern chances.

## Acceptance Criteria

- Average first-run player survives long enough to understand the game.
- Skilled play can reach high difficulty.
- Deaths feel attributable to player action, not random unfairness.

## Status

Done in current MVP.

## Notes

- Slowed the difficulty ramp from 45s to 55s so the first minute breathes more naturally.
- Reduced maximum world speed and raised minimum spawn interval slightly to avoid late-ramp clutter.
- Extended safe start to 3.2s so new players have time to understand movement.
- Added staged pattern weights so spike density ramps in clear phases instead of jumping suddenly.
- During spike cooldown or tight vertical gaps, the game now spawns honey-only rows instead of empty pauses.
