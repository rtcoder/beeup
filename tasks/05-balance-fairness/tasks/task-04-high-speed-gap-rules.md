# Task: Tune High-Speed Gap Rules

## Goal

Avoid unreadable consecutive obstacles at high speed.

## Scope

- Track recent spike rows.
- Enforce vertical gap when speed is high.
- Tune `MIN_VERTICAL_GAP`.

## Acceptance Criteria

- At high speed, spike rows do not stack too closely.
- Player has enough reaction time to dodge.

## Status

Partially done. Current MVP has a simple recent-spike check.
