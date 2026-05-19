import type { ScorePayload, ScoreResponse } from '../../shared/game';

const MAX_SCORE = 999_999;
const MAX_ELAPSED_MS = 10 * 60 * 1000;

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

export function validateScorePayload(payload: unknown): payload is ScorePayload {
  if (typeof payload !== 'object' || payload === null) return false;

  const candidate = payload as Record<string, unknown>;
  return (
    isFiniteNumber(candidate.score) &&
    candidate.score >= 0 &&
    candidate.score <= MAX_SCORE &&
    isFiniteNumber(candidate.honeyScore) &&
    candidate.honeyScore >= 0 &&
    candidate.honeyScore <= MAX_SCORE &&
    isFiniteNumber(candidate.distanceScore) &&
    candidate.distanceScore >= 0 &&
    candidate.distanceScore <= MAX_SCORE &&
    isFiniteNumber(candidate.elapsedMs) &&
    candidate.elapsedMs >= 0 &&
    candidate.elapsedMs <= MAX_ELAPSED_MS
  );
}

export function acceptScore(payload: unknown): ScoreResponse {
  if (!validateScorePayload(payload)) {
    throw new Error('Invalid score payload');
  }

  return { ok: true };
}
