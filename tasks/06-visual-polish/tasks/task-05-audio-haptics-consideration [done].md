# Task: Consider Audio Or Haptic Feedback [done]

## Goal

Decide whether lightweight feedback improves the game without hurting Reddit-post usability.

## Scope

- Evaluate tiny sound effects for honey and death.
- Evaluate mobile vibration for death or honey.
- Keep default experience non-annoying.

## Acceptance Criteria

- Decision is documented.
- Any implemented feedback can be muted or is minimal.
- No external heavy audio assets are required for MVP.

## Status

Done in current MVP.

## Decision

- Skip audio in MVP to keep the Reddit post lightweight and non-annoying by default.
- Add minimal optional haptic feedback through `navigator.vibrate`.
- Honey collection uses a very short vibration.
- Game over uses a slightly longer pattern.
- Browsers/devices without vibration support silently ignore the feedback.
