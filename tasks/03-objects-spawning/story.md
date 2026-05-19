# Story: Objects And Spawning

As a player, I want honey and spikes to appear in readable patterns so that each run has variety without becoming unfair.

## Scope

- entity model
- honey
- spikes
- lane-based row spawning
- object cleanup
- spawn pattern expansion

## Acceptance Criteria

- Honey and spikes spawn from the top.
- Entities move down at world speed.
- Entities are removed after leaving the screen.
- Rows always leave at least one safe lane.
