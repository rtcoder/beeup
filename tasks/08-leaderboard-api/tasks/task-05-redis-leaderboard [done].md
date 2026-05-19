# Task: Add Redis Leaderboard [done]

## Goal

Persist top scores in Devvit Redis.

## Scope

- Store scores per post or subreddit.
- Keep only top N scores.
- Include user identity when available.

## Acceptance Criteria

- Scores persist between sessions.
- Leaderboard can return sorted top scores.
- User best score can be updated without duplicates.

## Status

Done in current MVP.

## Notes

- Scores are stored in a Redis sorted set.
- Leaderboard keys are per post when `context.postId` exists, with a global fallback for non-post contexts.
- Top scores are returned in descending score order.
- Entries include username when available.
