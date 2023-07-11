// @ts-check

import { fileURLToPath } from 'url';
import path from 'path';
import Pug from 'pug';
import pointOfView from '@fastify/view';
import fastifyStatic from '@fastify/static';
import Rollbar from 'rollbar';
import traps from '@dnlup/fastify-traps';

import addRoutes from './routes.js';

const __dirname = fileURLToPath(path.dirname(import.meta.url));

const registerErrorHandler = (app) => {
  app.setErrorHandler((error, request, reply) => {
    const { ROLLBAR_TOKEN } = process.env;
    const { message: errorMessage } = error;

    if (ROLLBAR_TOKEN) {
      const rollbar = new Rollbar({
        accessToken: ROLLBAR_TOKEN,
        captureUncaught: true,
        captureUnhandledRejections: true,
      });

      rollbar.error(errorMessage);
    }

    reply.status(500).view('500', { errorMessage });
  });
};

const registerPlugins = (app) => {
  app
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
    }).register(traps, {
      onSignal(signal) {
        console.debug(`Received signal ${signal}`);
      },
    });
};

// eslint-disable-next-line no-unused-vars
export default (app, options) => {
  registerPlugins(app);
  addRoutes(app);
  registerErrorHandler(app);

  return app;
};

// export const options = {
//   logger: {
//     options: {
//       singleLine: true,
//     },
//   },
// };
