import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { createDatabase } from "./database.mjs";

const defaultRoot = fileURLToPath(new URL("../", import.meta.url));

const reply = (response, status, data) => {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  response.end(`${JSON.stringify(data)}\n`);
};

const readBody = async (request) => {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 16 * 1024) {
      const error = new Error("Request body is too large");
      error.status = 413;
      throw error;
    }
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    const error = new Error("Expected JSON request body");
    error.status = 400;
    throw error;
  }
};

export const createApplication = ({ env = process.env, root = defaultRoot } = {}) => {
  const version = readFileSync(join(root, "VERSION"), "utf8").trim();
  const message = env.SERVER_MESSAGE ?? readFileSync(join(root, "message.txt"), "utf8").trimEnd();
  const ui = readFileSync(join(root, "public/index.html"), "utf8");
  const database = createDatabase(env);

  const server = createServer(async (request, response) => {
    const path = new URL(request.url, "http://localhost").pathname;
    console.log(JSON.stringify({ event: "request", method: request.method, path }));
    try {
      if (request.method === "GET" && path === "/") {
        reply(response, 200, { message, version });
        return;
      }
      if (request.method === "GET" && path === "/ui") {
        response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
        response.end(ui);
        return;
      }
      if (request.method === "GET" && path === "/ready") {
        if (database) {
          await database.query("SELECT id FROM notes LIMIT 1");
        }
        reply(response, 200, { status: "ready", database: Boolean(database) });
        return;
      }
      if (path === "/notes" && ["GET", "POST"].includes(request.method)) {
        if (!database) {
          reply(response, 503, { error: "database_not_configured" });
          return;
        }
        if (request.method === "GET") {
          const result = await database.query("SELECT id, text FROM notes ORDER BY id");
          reply(response, 200, result.rows);
          return;
        }
        const contentType = request.headers["content-type"]?.split(";")[0].trim();
        if (contentType !== "application/json") {
          reply(response, 415, { error: "Expected application/json" });
          return;
        }
        const body = await readBody(request);
        if (typeof body?.text !== "string" || !body.text.trim() || body.text.length > 1000) {
          reply(response, 400, { error: "Expected text with 1 to 1000 characters" });
          return;
        }
        const result = await database.query(
          "INSERT INTO notes (text) VALUES ($1) RETURNING id, text",
          [body.text.trim()],
        );
        reply(response, 201, result.rows[0]);
        return;
      }
      reply(response, 404, { error: "not_found" });
    } catch (error) {
      if (error.status) {
        reply(response, error.status, { error: error.message });
        return;
      }
      console.error(JSON.stringify({ event: "request_failed", code: error.code || "unknown" }));
      reply(response, 503, { error: "database_unavailable" });
    }
  });
  server.requestTimeout = 5000;
  const close = async () => {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
      server.closeIdleConnections();
    });
    if (database) {
      await database.end();
    }
  };
  return { server, close };
};
