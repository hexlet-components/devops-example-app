import fastify from 'fastify';
import _ from 'lodash';

import init from '../server/plugin.js';

describe('app', () => {
  let app;

  beforeAll(async () => {
    app = fastify();
    await init(app);
  });

  it('main page without environment variable SERVER_MESSAGE', async () => {
    _.unset(process.env, 'SERVER_MESSAGE');
    const res = await app.inject({
      method: 'GET',
      url: '/',
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatch('Привет от Хекслета!');
    expect(res.body).toMatch('Приложение запущено, но сообщение сервера не установлено!');
  });

  it('main page with environment variable SERVER_MESSAGE', async () => {
    process.env.SERVER_MESSAGE = 'Hexlet Awesome Server';

    const res = await app.inject({
      method: 'GET',
      url: '/',
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatch('Привет от Хекслета!');
    expect(res.body).toMatch(`Приложение запущено и передает сообщение: ${process.env.SERVER_MESSAGE}`);
  });
  //
  // after all(() => {
  //   app.close();
  // });
});
