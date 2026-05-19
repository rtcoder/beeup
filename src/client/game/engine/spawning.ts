import {
  GAME_WIDTH,
  HONEY_POINTS,
  HONEY_SIZE,
  LANES,
  LANE_WIDTH,
  SAFE_START_MS,
  SPIKE_HEIGHT,
  SPIKE_WIDTH,
} from './constants';
import type { Entity, GameState } from './types';

type RowPattern = 'singleHoney' | 'doubleHoney' | 'singleSpike' | 'twoSpikes' | 'mixed';

function randomLane(except: Set<number> = new Set()): number {
  const available = Array.from({ length: LANES }, (_, lane) => lane).filter((lane) => !except.has(lane));
  return available[Math.floor(Math.random() * available.length)] ?? 0;
}

function laneCenter(lane: number): number {
  return lane * LANE_WIDTH + LANE_WIDTH / 2;
}

function entityId(state: GameState, type: string): string {
  const id = `${type}-${state.nextEntityId}`;
  state.nextEntityId += 1;
  return id;
}

function createHoney(state: GameState, lane: number): Entity {
  return {
    id: entityId(state, 'honey'),
    type: 'honey',
    x: laneCenter(lane) - HONEY_SIZE / 2,
    y: -HONEY_SIZE - 8,
    width: HONEY_SIZE,
    height: HONEY_SIZE,
    points: HONEY_POINTS,
  };
}

function createSpike(state: GameState, lane: number): Entity {
  return {
    id: entityId(state, 'spike'),
    type: 'spike',
    x: Math.min(GAME_WIDTH - SPIKE_WIDTH, Math.max(0, laneCenter(lane) - SPIKE_WIDTH / 2)),
    y: -SPIKE_HEIGHT - 8,
    width: SPIKE_WIDTH,
    height: SPIKE_HEIGHT,
  };
}

function choosePattern(state: GameState): RowPattern {
  if (state.elapsedMs < SAFE_START_MS) {
    return Math.random() < 0.7 ? 'singleHoney' : 'doubleHoney';
  }

  const roll = Math.random();
  if (state.difficulty > 0.55 && roll > 0.86) return 'twoSpikes';
  if (state.difficulty > 0.7 && roll > 0.74) return 'mixed';
  if (roll < 0.34) return 'singleHoney';
  if (roll < 0.52) return 'doubleHoney';
  if (roll < 0.76) return 'singleSpike';
  return 'mixed';
}

export function spawnRow(state: GameState): void {
  const pattern = choosePattern(state);
  const entities: Entity[] = [];

  if (pattern === 'singleHoney') {
    entities.push(createHoney(state, randomLane()));
  }

  if (pattern === 'doubleHoney') {
    const first = randomLane();
    const second = randomLane(new Set([first]));
    entities.push(createHoney(state, first), createHoney(state, second));
  }

  if (pattern === 'singleSpike') {
    entities.push(createSpike(state, randomLane()));
  }

  if (pattern === 'twoSpikes') {
    const first = randomLane();
    const second = randomLane(new Set([first]));
    entities.push(createSpike(state, first), createSpike(state, second));
  }

  if (pattern === 'mixed') {
    const spikeLane = randomLane();
    const honeyLane = randomLane(new Set([spikeLane]));
    entities.push(createSpike(state, spikeLane), createHoney(state, honeyLane));
  }

  state.entities.push(...entities);
}
