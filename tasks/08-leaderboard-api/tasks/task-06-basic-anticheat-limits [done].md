# Task: Add Basic Anti-Cheat Limits [done]

## Goal

Reject impossible or absurd score submissions.

## Scope

- Validate elapsed time.
- Validate max score based on elapsed time and honey count if available.
- Cap submitted values.

## Acceptance Criteria

- Obviously fake payloads are rejected.
- Legitimate high scores are not rejected too aggressively.
- Rules are documented near validation code.

## Status

Done in current MVP.

## Notes

- Score fields must be finite non-negative integers.
- `score` must match `honeyScore + distanceScore` within a small rounding tolerance.
- Payload elapsed time is capped at ten minutes.
- Maximum score is capped by elapsed time plus a generous honey pickup limit.
