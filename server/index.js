// @ts-check

const path = require('path');
const fastify = require('fastify');
const Pug = require('pug');
const pointOfView = require('point-of-view');
const fastifyStatic = require('fastify-static');
const fatifyReverseRoutes = require('fastify-reverse-routes');

const addRoutes = require('./routes.js');

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

  return app;
};
