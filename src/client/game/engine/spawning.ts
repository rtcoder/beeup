import {
  GAME_WIDTH,
  GOLDEN_HONEY_POINTS,
  GOLDEN_HONEY_SIZE,
  LARGE_HONEY_POINTS,
  LARGE_HONEY_SIZE,
  LANES,
  LANE_WIDTH,
  SAFE_START_MS,
  SMALL_HONEY_POINTS,
  SMALL_HONEY_SIZE,
  SPIKE_HEIGHT,
  SPIKE_WIDTH,
} from './constants';
import type { Entity, GameState, HoneyVariant } from './types';

type RowPattern = 'singleHoney' | 'doubleHoney' | 'singleSpike' | 'twoSpikes' | 'spikeHoneySpike' | 'mixed';

interface SpawnOptions {
  allowSpikes: boolean;
}

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

function honeyStats(variant: HoneyVariant): { points: number; size: number } {
  if (variant === 'small') return { points: SMALL_HONEY_POINTS, size: SMALL_HONEY_SIZE };
  if (variant === 'golden') return { points: GOLDEN_HONEY_POINTS, size: GOLDEN_HONEY_SIZE };
  return { points: LARGE_HONEY_POINTS, size: LARGE_HONEY_SIZE };
}

function chooseHoneyVariant(state: GameState): HoneyVariant {
  const roll = Math.random();
  const goldenChance = 0.04 + state.difficulty * 0.04;
  const largeChance = 0.34 + state.difficulty * 0.08;

  if (roll < goldenChance) return 'golden';
  if (roll < goldenChance + largeChance) return 'large';
  return 'small';
}

function createHoney(state: GameState, lane: number, variant: HoneyVariant = chooseHoneyVariant(state)): Entity {
  const { points, size } = honeyStats(variant);

  return {
    id: entityId(state, 'honey'),
    type: 'honey',
    honeyVariant: variant,
    x: laneCenter(lane) - size / 2,
    y: -size - 8,
    width: size,
    height: size,
    points,
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

function chooseHoneyPattern(): RowPattern {
  return Math.random() < 0.62 ? 'singleHoney' : 'doubleHoney';
}

function choosePattern(state: GameState, allowSpikes: boolean): RowPattern {
  if (!allowSpikes || state.elapsedMs < SAFE_START_MS) {
    return chooseHoneyPattern();
  }

  if (state.difficulty < 0.22) {
    const roll = Math.random();
    if (roll < 0.46) return 'singleHoney';
    if (roll < 0.7) return 'doubleHoney';
    if (roll < 0.9) return 'singleSpike';
    return 'mixed';
  }

  if (state.difficulty < 0.55) {
    const roll = Math.random();
    if (roll < 0.33) return 'singleHoney';
    if (roll < 0.54) return 'doubleHoney';
    if (roll < 0.78) return 'singleSpike';
    if (roll < 0.93) return 'mixed';
    return 'twoSpikes';
  }

  if (state.difficulty < 0.78) {
    const roll = Math.random();
    if (roll < 0.25) return 'singleHoney';
    if (roll < 0.43) return 'doubleHoney';
    if (roll < 0.63) return 'singleSpike';
    if (roll < 0.82) return 'mixed';
    if (roll < 0.96) return 'twoSpikes';
    return 'spikeHoneySpike';
  }

  const roll = Math.random();
  if (roll < 0.2) return 'singleHoney';
  if (roll < 0.34) return 'doubleHoney';
  if (roll < 0.52) return 'singleSpike';
  if (roll < 0.72) return 'mixed';
  if (roll < 0.9) return 'twoSpikes';
  return 'spikeHoneySpike';
}

function addSpike(state: GameState, entities: Entity[], lane: number): void {
  entities.push(createSpike(state, lane));
  state.lastSpikeRowElapsedMs = state.elapsedMs;
}

export function spawnRow(state: GameState, options: SpawnOptions = { allowSpikes: true }): void {
  const pattern = choosePattern(state, options.allowSpikes);
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
    addSpike(state, entities, randomLane());
  }

  if (pattern === 'twoSpikes') {
    const safeLane = randomLane();
    const first = randomLane(new Set([safeLane]));
    const second = randomLane(new Set([safeLane, first]));
    addSpike(state, entities, first);
    addSpike(state, entities, second);
  }

  if (pattern === 'spikeHoneySpike') {
    const honeyLane = 1 + Math.floor(Math.random() * (LANES - 2));
    const leftSpikeLane = honeyLane - 1;
    const rightSpikeLane = honeyLane + 1;
    addSpike(state, entities, leftSpikeLane);
    entities.push(createHoney(state, honeyLane, Math.random() < 0.26 ? 'golden' : 'large'));
    addSpike(state, entities, rightSpikeLane);
  }

  if (pattern === 'mixed') {
    const safeLane = randomLane();
    const spikeLane = randomLane(new Set([safeLane]));
    const honeyLane = randomLane(new Set([spikeLane]));
    addSpike(state, entities, spikeLane);
    entities.push(createHoney(state, honeyLane));
  }

  state.entities.push(...entities);
}
