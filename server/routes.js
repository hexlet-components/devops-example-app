// @ts-check

const _ = require('lodash');

module.exports = (app) => {
  app.get('/', { name: 'root' }, (req, reply) => {
    const serverMessage = process.env.SERVER_MESSAGE;

    reply.view('index', { serverMessage });
  });
  app.get('/error', {name: 'error'}, (_req, _reply) => {
    throw new Error('Oops! Something went wrong!');
  });
};
