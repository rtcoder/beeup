import { serve } from '@hono/node-server';
import { createServer, getServerPort, context } from '@devvit/web/server';
import { Hono } from 'hono';
import { createGamePost } from './core/post';
import { acceptScore, getLeaderboard } from './routes/score';

const app = new Hono();

app.post('/api/score', async (c) => {
  try {
    const payload = await c.req.json();
    return c.json(await acceptScore(payload));
  } catch {
    return c.json({ ok: false, error: 'Invalid score payload' }, 400);
  }
});

app.get('/api/leaderboard', async (c) => {
  try {
    return c.json(await getLeaderboard());
  } catch (error) {
    console.error('Failed to read Bee Up! leaderboard', error);
    return c.json({ ok: false, error: 'Failed to read leaderboard' }, 500);
  }
});

app.post('/internal/menu/post-create', async (c) => {
  try {
    const post = await createGamePost();
    return c.json(
      {
        navigateTo: `https://reddit.com/r/${context.subredditName}/comments/${post.id}`,
      },
      200,
    );
  } catch (error) {
    console.error('Failed to create Bee Up! post', error);
    return c.json({ showToast: 'Failed to create Bee Up! post' }, 400);
  }
});

serve({
  fetch: app.fetch,
  createServer,
  port: getServerPort(),
});

export { acceptScore, validateScorePayload } from './routes/score';
