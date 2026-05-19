export interface ScorePayload {
  score: number;
  honeyScore: number;
  distanceScore: number;
  elapsedMs: number;
}

export interface LeaderboardEntry {
  rank: number;
  score: number;
  username: string;
  honeyScore: number;
  distanceScore: number;
  elapsedMs: number;
  createdAt: number;
}

export interface ScoreResponse {
  ok: true;
  leaderboard: LeaderboardEntry[];
}

export interface LeaderboardResponse {
  ok: true;
  leaderboard: LeaderboardEntry[];
}
