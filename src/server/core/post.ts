import { reddit } from '@devvit/web/server';

export async function createGamePost() {
  return await reddit.submitCustomPost({
    title: 'Bee Up!',
    entry: 'default',
    postData: {
      version: 1,
    },
    textFallback: {
      text: 'Bee Up! is an interactive Reddit game. Open this post in a supported Reddit client to play.',
    },
    styles: {
      backgroundColor: '#d9f3ffff',
      backgroundColorDark: '#d9f3ffff',
    },
  });
}
