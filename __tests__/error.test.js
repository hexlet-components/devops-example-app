const supertest = require('supertest');

const getApp = require('../server/index.js');

describe('app', () => {
  let app;

  beforeAll(async () => {
    app = getApp();
    await app.ready();
  });

  it('error page', async () => {
    const res = await supertest(app.server)
      .get('/error')
      .expect(500);

    expect(res.text).toMatch('Внимание, тут что-то не так!');
    expect(res.text).toMatch('Oops! Something went wrong!');
  });

  afterAll(() => {
    app.close();
  });
});
