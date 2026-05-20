import { context, redis, reddit } from '@devvit/web/server';
import type { LeaderboardEntry, LeaderboardResponse, ScorePayload, ScoreResponse } from '../../shared/game';

const MAX_SCORE = 999_999;
const MAX_ELAPSED_MS = 10 * 60 * 1000;
const LEADERBOARD_LIMIT = 10;
const SCORE_PER_MS_LIMIT = 0.0135;
const MIN_PICKUP_INTERVAL_MS = 300;
const MAX_HONEY_POINTS = 75;
const MAX_BONUS_PER_SECOND = 38;

interface StoredLeaderboardEntry extends Omit<LeaderboardEntry, 'rank'> {
  id: string;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isIntegerScore(value: number): boolean {
  return Number.isInteger(value);
}

function maxPossibleScore(payload: ScorePayload): number {
  const distanceLimit = payload.elapsedMs * SCORE_PER_MS_LIMIT;
  const maxPickups = Math.floor(payload.elapsedMs / MIN_PICKUP_INTERVAL_MS) + 4;
  const honeyLimit = maxPickups * MAX_HONEY_POINTS;
  const bonusLimit = Math.ceil((payload.elapsedMs / 1000) * MAX_BONUS_PER_SECOND) + maxPickups * 42 + 80;
  return Math.ceil(distanceLimit + honeyLimit + bonusLimit);
}

export function validateScorePayload(payload: unknown): payload is ScorePayload {
  if (typeof payload !== 'object' || payload === null) return false;

  const candidate = payload as Record<string, unknown>;
  if (
    isFiniteNumber(candidate.score) &&
    candidate.score >= 0 &&
    candidate.score <= MAX_SCORE &&
    isIntegerScore(candidate.score) &&
    isFiniteNumber(candidate.honeyScore) &&
    candidate.honeyScore >= 0 &&
    candidate.honeyScore <= MAX_SCORE &&
    isIntegerScore(candidate.honeyScore) &&
    isFiniteNumber(candidate.distanceScore) &&
    candidate.distanceScore >= 0 &&
    candidate.distanceScore <= MAX_SCORE &&
    isIntegerScore(candidate.distanceScore) &&
    isFiniteNumber(candidate.bonusScore) &&
    candidate.bonusScore >= 0 &&
    candidate.bonusScore <= MAX_SCORE &&
    isIntegerScore(candidate.bonusScore) &&
    isFiniteNumber(candidate.elapsedMs) &&
    candidate.elapsedMs >= 0 &&
    candidate.elapsedMs <= MAX_ELAPSED_MS &&
    isIntegerScore(candidate.elapsedMs)
  ) {
    const typedCandidate = candidate as unknown as ScorePayload;
    const expectedScore = typedCandidate.honeyScore + typedCandidate.distanceScore + typedCandidate.bonusScore;
    return (
      Math.abs(typedCandidate.score - expectedScore) <= 2 &&
      typedCandidate.honeyScore <= typedCandidate.score &&
      typedCandidate.bonusScore <= typedCandidate.score &&
      typedCandidate.score <= maxPossibleScore(typedCandidate)
    );
  }

  return false;
}

function leaderboardKey(): string {
  return `leaderboard:${context.postId ?? 'global'}`;
}

function safeInteger(value: unknown): number {
  return isFiniteNumber(value) ? Math.max(0, Math.floor(value)) : 0;
}

function parseLeaderboardMember(member: string, score: number, index: number): LeaderboardEntry | null {
  try {
    const parsed = JSON.parse(member) as StoredLeaderboardEntry;
    return {
      rank: index + 1,
      score: Math.floor(score),
      username: parsed.username || 'anonymous',
      honeyScore: safeInteger(parsed.honeyScore),
      distanceScore: safeInteger(parsed.distanceScore),
      bonusScore: safeInteger(parsed.bonusScore),
      elapsedMs: safeInteger(parsed.elapsedMs),
      createdAt: safeInteger(parsed.createdAt),
    };
  } catch {
    return null;
  }
}

export async function getLeaderboard(): Promise<LeaderboardResponse> {
  const rows = (await redis.zRange(leaderboardKey(), 0, LEADERBOARD_LIMIT - 1, {
    by: 'rank',
    reverse: true,
  })) as Array<{ member: string; score: number }>;

  return {
    ok: true,
    leaderboard: rows
      .map((row, index) => parseLeaderboardMember(row.member, row.score, index))
      .filter((entry): entry is LeaderboardEntry => entry !== null),
  };
}

export async function acceptScore(payload: unknown): Promise<ScoreResponse> {
  if (!validateScorePayload(payload)) {
    throw new Error('Invalid score payload');
  }

  const username = (await reddit.getCurrentUsername()) ?? 'anonymous';
  const createdAt = Date.now();
  const member: StoredLeaderboardEntry = {
    id: `${createdAt}-${Math.random().toString(36).slice(2)}`,
    score: payload.score,
    username,
    honeyScore: payload.honeyScore,
    distanceScore: payload.distanceScore,
    bonusScore: payload.bonusScore,
    elapsedMs: payload.elapsedMs,
    createdAt,
  };

  await redis.zAdd(leaderboardKey(), {
    member: JSON.stringify(member),
    score: payload.score,
  });

  return await getLeaderboard();
}
