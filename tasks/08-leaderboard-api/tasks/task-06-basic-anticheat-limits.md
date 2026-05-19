# Task: Add Basic Anti-Cheat Limits

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

Open.
