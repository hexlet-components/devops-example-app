import supertest from 'supertest';
import fastify from 'fastify';
import _ from 'lodash';

import init from '../server/plugin.js';

describe('app', () => {
  let app;

  beforeAll(async () => {
    app = fastify();
    await init(app);
    await app.ready();
  });

  beforeEach(() => {
    _.unset(process.env, 'SERVER_MESSAGE');
  });

  it('main page without environment variable SERVER_MESSAGE', async () => {
    const res = await supertest(app.server)
      .get('/')
      .expect(200);

    expect(res.text).toMatch('Привет от Хекслета!');
    expect(res.text).toMatch('Приложение запущено, но сообщение сервера не установлено!');
  });

  it('main page with environment variable SERVER_MESSAGE', async () => {
    process.env.SERVER_MESSAGE = 'Hexlet Awesome Server';

    const res = await supertest(app.server)
      .get('/')
      .expect(200);

    expect(res.text).toMatch('Привет от Хекслета!');
    expect(res.text).toMatch(`Приложение запущено и передает сообщение: ${process.env.SERVER_MESSAGE}`);
  });

  afterAll(() => {
    app.close();
  });
});
