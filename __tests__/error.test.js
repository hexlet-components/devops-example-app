import fastify from 'fastify';

import init from '../server/plugin.js';

describe('app', () => {
  let app;

  beforeAll(async () => {
    app = fastify();
    await init(app);
  });

  it('error page', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/error',
    });

    expect(res.body).toMatch('Внимание, тут что-то не так!');
    expect(res.body).toMatch('Oops! Something went wrong!');
  });
});
