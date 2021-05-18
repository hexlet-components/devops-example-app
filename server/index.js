// @ts-check

const path = require('path');
const fastify = require('fastify');
const Pug = require('pug');
const pointOfView = require('point-of-view');
const fastifyStatic = require('fastify-static');
const fatifyReverseRoutes = require('fastify-reverse-routes');
const Rollbar = require('rollbar');
require('dotenv').config();

const addRoutes = require('./routes.js');

const registerErrorHandler = (app) => {
  app.setErrorHandler((error, request, reply) => {
    const { ROLLBAR_TOKEN } = process.env;
    const { message: errorMessage } = error;
    reply.view('500', { errorMessage });

    if (!ROLLBAR_TOKEN) {
      return;
    }

    const rollbar = new Rollbar({
      accessToken: ROLLBAR_TOKEN,
      captureUncaught: true,
      captureUnhandledRejections: true,
    });

    rollbar.error(errorMessage);
  });
};

const registerPlugins = (app) => {
  app
    .register(fatifyReverseRoutes.plugin)
    .register(fastifyStatic, {
      root: path.join(__dirname, '..', 'node_modules', 'bootstrap', 'dist'),
      prefix: '/assets/',
    })
    .register(pointOfView, {
      engine: {
        pug: Pug,
      },
      includeViewExtension: true,
      templates: path.join(__dirname, '..', 'server', 'views'),
    });
};

module.exports = () => {
  const app = fastify({
    logger: true,
  });

  registerPlugins(app);
  addRoutes(app);
  registerErrorHandler(app);

  return app;
};
