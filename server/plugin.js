// @ts-check

import path from "node:path";
import { fileURLToPath } from "node:url";
import traps from "@dnlup/fastify-traps";
import fastifyStatic from "@fastify/static";
import pointOfView from "@fastify/view";
import * as Sentry from "@sentry/node";
import Pug from "pug";

import addRoutes from "./routes.js";

const __dirname = fileURLToPath(path.dirname(import.meta.url));

const registerErrorHandler = (app) => {
  app.setErrorHandler((error, _request, reply) => {
    const { message: errorMessage } = error;

    Sentry.captureException(error);

    reply.status(500).view("500", { errorMessage });
  });
};

const registerPlugins = (app) => {
  app
    // Собранный css лежит в dist: его пишет vite из src/styles.css.
    .register(fastifyStatic, {
      root: path.join(__dirname, "..", "dist"),
      prefix: "/assets/",
    })
    .register(fastifyStatic, {
      root: path.join(__dirname, "..", "public"),
      prefix: "/",
      decorateReply: false,
    })
    .register(pointOfView, {
      engine: {
        pug: Pug,
      },
      includeViewExtension: true,
      templates: path.join(__dirname, "..", "server", "views"),
    })
    .register(traps, {
      onSignal(signal) {
        console.debug(`Received signal ${signal}`);
      },
    });
};

export default (app, _options) => {
  registerPlugins(app);
  addRoutes(app);
  registerErrorHandler(app);

  return app;
};

export const options = {
  logger: {
    transport: {
      target: "pino-pretty",
      options: {
        singleLine: true,
      },
    },
  },
};
