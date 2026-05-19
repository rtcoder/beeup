# Task: Add POST /api/score Route [done]

## Goal

Expose score validation through an HTTP endpoint.

## Scope

- Add Devvit/Express route.
- Parse JSON body.
- Return success or validation error.

## Acceptance Criteria

- `POST /api/score` accepts valid score payloads.
- Invalid payloads return a non-2xx response.
- Route can be called from the client.

## Status

Done in current MVP.

## Notes

- Added `POST /api/score` to the Devvit/Hono server.
- Valid payloads are written to Redis and return the latest leaderboard.
- Invalid payloads return `400`.
- Added `GET /api/leaderboard` for loading the current top scores.
