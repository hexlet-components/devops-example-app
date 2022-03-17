// @ts-check

import { fileURLToPath } from 'url';
import path from 'path';
import Pug from 'pug';
import pointOfView from 'point-of-view';
import fastifyStatic from 'fastify-static';
import fastifyReverseRoutes from 'fastify-reverse-routes';
import Rollbar from 'rollbar';

import addRoutes from './routes.js';

const __dirname = fileURLToPath(path.dirname(import.meta.url));

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
    .register(fastifyReverseRoutes.plugin)
    .register(fastifyStatic, {
      root: path.join(__dirname, '..', 'node_modules', 'bootstrap', 'dist'),
      prefix: '/assets/',
    })
    .register(fastifyStatic, {
      root: path.join(__dirname, '..', 'public'),
      prefix: '/',
      decorateReply: false,
    })
    .register(pointOfView, {
      engine: {
        pug: Pug,
      },
      includeViewExtension: true,
      templates: path.join(__dirname, '..', 'server', 'views'),
    });
};

// eslint-disable-next-line no-unused-vars
export default (app, options) => {
  registerPlugins(app);
  addRoutes(app);
  registerErrorHandler(app);

  return app;
};
