# Task: Make Canvas Responsive And Sharp [done]

## Goal

Keep game logic in a fixed `390 x 700` space while rendering sharply on responsive screens.

## Scope

- Scale canvas through CSS.
- Preserve aspect ratio.
- Apply device pixel ratio scaling.
- Avoid horizontal page scroll.

## Acceptance Criteria

- Canvas fits mobile width.
- Canvas is centered on desktop.
- Canvas is not blurry on retina screens.
- Pointer coordinates map correctly to game coordinates.

## Status

Done in current MVP.

## Notes

- Canvas keeps fixed `390 x 700` game coordinates.
- CSS controls responsive display size and aspect ratio.
- Backing canvas dimensions now follow the actual rendered element size times device pixel ratio.
- `ResizeObserver` reapplies the canvas transform after viewport/layout changes.
- Pointer coordinates continue to map from rendered canvas bounds back to fixed game coordinates.
