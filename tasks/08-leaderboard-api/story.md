# Story: Leaderboard API

As a player, I want scores to be saved later so that I can compare my best run with others.

## Scope

- score payload validation
- `POST /api/score`
- Redis persistence
- leaderboard queries
- anti-cheat limits
- client submission flow

## Acceptance Criteria

- Frontend can submit final scores.
- Server validates payload ranges.
- Invalid scores are rejected.
- Later versions can store and return leaderboards.
