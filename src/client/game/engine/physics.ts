import {
  DIFFICULTY_RAMP_MS,
  COMBO_BONUS_MAX,
  COMBO_BONUS_STEP,
  COMBO_WINDOW_MS,
  GAME_HEIGHT,
  GAME_WIDTH,
  INITIAL_SPAWN_INTERVAL_MS,
  INITIAL_WORLD_SPEED,
  MAGNET_DURATION_MS,
  MAGNET_PULL_SPEED,
  MAGNET_RADIUS,
  MAX_WORLD_SPEED,
  MAX_VERTICAL_GAP,
  MIN_SPAWN_INTERVAL_MS,
  MIN_VERTICAL_GAP,
  NEAR_MISS_MARGIN,
  NEAR_MISS_POINTS,
  PLAYER_SPEED,
  SCORE_PER_SECOND,
  SHIELD_MAX_CHARGES,
  SPIKE_ROW_COOLDOWN_MS,
  TOUCH_FOLLOW_RATE,
  TOUCH_SNAP_DISTANCE,
} from './constants';
import { intersects } from './collision';
import { spawnRow } from './spawning';
import type { GameState, InputState, Rect, ScoreSnapshot } from './types';

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function updateDifficulty(state: GameState): void {
  const difficulty = Math.min(1, state.elapsedMs / DIFFICULTY_RAMP_MS);
  const overtime = Math.max(0, state.elapsedMs - DIFFICULTY_RAMP_MS);
  const overtimeMultiplier = 1 + Math.min(0.35, overtime / 120_000);

  state.difficulty = difficulty;
  state.worldSpeed =
    (INITIAL_WORLD_SPEED + (MAX_WORLD_SPEED - INITIAL_WORLD_SPEED) * difficulty) * overtimeMultiplier;
  state.spawnIntervalMs =
    INITIAL_SPAWN_INTERVAL_MS -
    (INITIAL_SPAWN_INTERVAL_MS - MIN_SPAWN_INTERVAL_MS) * difficulty;
}

function updatePlayer(state: GameState, input: InputState, deltaSeconds: number): void {
  let velocity = 0;
  if (input.left) velocity -= PLAYER_SPEED;
  if (input.right) velocity += PLAYER_SPEED;

  if (input.pointerActive && input.targetX !== null) {
    const targetPlayerX = clamp(input.targetX - state.player.width / 2, 0, GAME_WIDTH - state.player.width);
    const distance = targetPlayerX - state.player.x;
    if (Math.abs(distance) <= TOUCH_SNAP_DISTANCE) {
      state.player.x = targetPlayerX;
    } else {
      const followAmount = 1 - Math.exp(-TOUCH_FOLLOW_RATE * deltaSeconds);
      state.player.x += distance * followAmount;
    }
    state.player.velocityX = 0;
  } else {
    state.player.velocityX = velocity;
    state.player.x += state.player.velocityX * deltaSeconds;
  }

  state.player.x = clamp(state.player.x, 0, GAME_WIDTH - state.player.width);
}

function spikeRowGap(state: GameState): number {
  return MIN_VERTICAL_GAP + (MAX_VERTICAL_GAP - MIN_VERTICAL_GAP) * state.difficulty;
}

function hasRecentSpike(state: GameState): boolean {
  const requiredGap = spikeRowGap(state);
  return state.entities.some((entity) => entity.type === 'spike' && entity.y < requiredGap);
}

function updateEntities(state: GameState, deltaSeconds: number): void {
  const playerCenterX = state.player.x + state.player.width / 2;
  const playerCenterY = state.player.y + state.player.height / 2;

  for (const entity of state.entities) {
    if (state.magnetTimeMs > 0 && entity.type === 'honey') {
      const entityCenterX = entity.x + entity.width / 2;
      const entityCenterY = entity.y + entity.height / 2;
      const dx = playerCenterX - entityCenterX;
      const dy = playerCenterY - entityCenterY;
      const distance = Math.hypot(dx, dy);
      if (distance > 0 && distance < MAGNET_RADIUS) {
        const pullDistance = Math.min(distance, MAGNET_PULL_SPEED * deltaSeconds);
        entity.x += (dx / distance) * pullDistance;
        entity.y += (dy / distance) * pullDistance;
      }
    }

    entity.y += (entity.speedY ?? state.worldSpeed) * deltaSeconds;
  }

  state.entities = state.entities.filter((entity) => entity.y < GAME_HEIGHT + 80);
}

function updateSpawning(state: GameState, deltaMs: number): void {
  state.spawnTimerMs += deltaMs;
  if (state.spawnTimerMs < state.spawnIntervalMs) return;

  const spikeCooldownActive = state.elapsedMs - state.lastSpikeRowElapsedMs < SPIKE_ROW_COOLDOWN_MS;
  const allowSpikes = !spikeCooldownActive && !hasRecentSpike(state);

  state.spawnTimerMs = 0;
  spawnRow(state, { allowSpikes });
}

function playerHitbox(state: GameState) {
  return {
    x: state.player.x + 6,
    y: state.player.y + 6,
    width: state.player.width - 12,
    height: state.player.height - 12,
  };
}

function entityHitbox(entity: { type: string; x: number; y: number; width: number; height: number }): Rect {
  const inset = entity.type === 'spike' ? 3 : 2;
  return {
    x: entity.x + inset,
    y: entity.y + inset,
    width: entity.width - inset * 2,
    height: entity.height - inset * 2,
  };
}

function expandedRect(rect: Rect, margin: number): Rect {
  return {
    x: rect.x - margin,
    y: rect.y - margin,
    width: rect.width + margin * 2,
    height: rect.height + margin * 2,
  };
}

function collectHoney(state: GameState, points: number): void {
  state.comboCount = state.comboTimerMs > 0 ? state.comboCount + 1 : 1;
  state.comboTimerMs = COMBO_WINDOW_MS;

  const comboBonus = Math.min(COMBO_BONUS_MAX, Math.max(0, state.comboCount - 1) * COMBO_BONUS_STEP);
  state.honeyScore += points;
  state.bonusScore += comboBonus;
}

function updateCollisions(state: GameState): boolean {
  const player = playerHitbox(state);
  const nearMissZone = expandedRect(player, NEAR_MISS_MARGIN);
  let hitSpike = false;

  state.entities = state.entities.filter((entity) => {
    const hitbox = entityHitbox(entity);

    if (entity.type === 'spike' && !entity.nearMissAwarded && !intersects(player, hitbox)) {
      const hasNearMiss = intersects(nearMissZone, hitbox);
      if (hasNearMiss) {
        entity.nearMissAwarded = true;
        state.bonusScore += NEAR_MISS_POINTS;
      }
    }

    if (!intersects(player, hitbox)) return true;

    if (entity.type === 'honey') {
      collectHoney(state, entity.points ?? 0);
      return false;
    }

    if (entity.type === 'powerUp') {
      if (entity.powerUpType === 'shield') {
        state.shieldCharges = Math.min(SHIELD_MAX_CHARGES, state.shieldCharges + 1);
      }
      if (entity.powerUpType === 'magnet') {
        state.magnetTimeMs = Math.max(state.magnetTimeMs, MAGNET_DURATION_MS);
      }
      return false;
    }

    if (state.shieldCharges > 0) {
      state.shieldCharges -= 1;
      return false;
    }

    hitSpike = true;
    return true;
  });

  return hitSpike;
}

export function updateGame(state: GameState, input: InputState, deltaMs: number): boolean {
  if (state.status !== 'playing') return false;

  const deltaSeconds = deltaMs / 1000;
  state.elapsedMs += deltaMs;
  state.magnetTimeMs = Math.max(0, state.magnetTimeMs - deltaMs);
  state.comboTimerMs = Math.max(0, state.comboTimerMs - deltaMs);
  if (state.comboTimerMs === 0) state.comboCount = 0;
  state.cloudOffset = (state.cloudOffset + state.worldSpeed * 0.16 * deltaSeconds) % GAME_HEIGHT;

  updateDifficulty(state);
  updatePlayer(state, input, deltaSeconds);
  updateEntities(state, deltaSeconds);
  updateSpawning(state, deltaMs);

  state.distanceScore += deltaSeconds * SCORE_PER_SECOND;
  const hitSpike = updateCollisions(state);
  state.score = Math.floor(state.distanceScore + state.honeyScore + state.bonusScore);

  return hitSpike;
}

export function snapshotScore(state: GameState): ScoreSnapshot {
  return {
    score: state.score,
    bestScore: state.bestScore,
    honeyScore: Math.floor(state.honeyScore),
    distanceScore: Math.floor(state.distanceScore),
    bonusScore: Math.floor(state.bonusScore),
    elapsedMs: Math.floor(state.elapsedMs),
    shieldCharges: state.shieldCharges,
    magnetTimeMs: Math.ceil(state.magnetTimeMs),
    comboCount: state.comboCount,
  };
}
