import test from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, mkdir, writeFile, copyFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createApplication } from "../lib/application.mjs";
import { createDatabase } from "../lib/database.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const execute = promisify(execFile);

const start = async (t, options = {}) => {
  const application = createApplication({ env: {}, ...options });
  application.server.listen(0, "127.0.0.1");
  await once(application.server, "listening");
  t.after(() => application.close());
  return `http://127.0.0.1:${application.server.address().port}`;
};

test("reports the supplied version and default message", async (t) => {
  const url = await start(t);
  const response = await fetch(url);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { message: "Hello from Docker", version: "1.0.0" });
});

test("message override leaves the built version unchanged", async (t) => {
  const url = await start(t, { env: { SERVER_MESSAGE: "Another message", VERSION: "9.9.9" } });
  assert.deepEqual(await (await fetch(url)).json(), {
    message: "Another message",
    version: "1.0.0",
  });
});

test("loads the version and message from files", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "docker-course-config-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  await mkdir(join(directory, "public"));
  await writeFile(join(directory, "VERSION"), "2.0.0\n");
  await writeFile(join(directory, "message.txt"), "Updated source\n");
  await copyFile(join(root, "public/index.html"), join(directory, "public/index.html"));
  const url = await start(t, { root: directory });
  assert.deepEqual(await (await fetch(url)).json(), {
    message: "Updated source",
    version: "2.0.0",
  });
});

test("is ready without a database and explains unavailable notes", async (t) => {
  const url = await start(t);
  assert.deepEqual(await (await fetch(`${url}/ready`)).json(), {
    status: "ready",
    database: false,
  });
  const response = await fetch(`${url}/notes`);
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { error: "database_not_configured" });
});

test("serves the interface and returns a JSON 404", async (t) => {
  const url = await start(t);
  const response = await fetch(`${url}/ui`);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /text\/html/);
  assert.match(await response.text(), /Заметки в Docker/);
  const missing = await fetch(`${url}/missing`);
  assert.equal(missing.status, 404);
  assert.deepEqual(await missing.json(), { error: "not_found" });
});

test("does not report readiness when configured database is unavailable", async (t) => {
  const url = await start(t, { env: { PGHOST: "127.0.0.1", PGPORT: "1" } });
  const response = await fetch(`${url}/ready`);
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { error: "database_unavailable" });
});

test("rejects malformed and invalid note bodies before using the database", async (t) => {
  const url = await start(t, { env: { PGHOST: "127.0.0.1", PGPORT: "1" } });
  for (const body of ["{", "null", '{"text":""}', '{"text":10}']) {
    const response = await fetch(`${url}/notes`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
    });
    assert.equal(response.status, 400);
  }
  const unsupported = await fetch(`${url}/notes`, { method: "POST", body: "hello" });
  assert.equal(unsupported.status, 415);
});

test("file secrets are read without putting the value into errors", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "docker-course-secret-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const file = join(directory, "password");
  await writeFile(file, "test-file-password\n");
  const database = createDatabase({ PGHOST: "127.0.0.1", PGPASSWORD_FILE: file });
  assert.equal(database.options.password, "test-file-password");
  await database.end();
  assert.throws(
    () => createDatabase({ PGHOST: "127.0.0.1", PGPASSWORD_FILE: file, PGPASSWORD: "other" }),
    /Use either PGPASSWORD or PGPASSWORD_FILE/,
  );
});

test("healthcheck command uses HTTP readiness", async (t) => {
  const url = await start(t);
  const { stdout } = await execute(process.execPath, ["scripts/healthcheck.mjs"], {
    cwd: root,
    env: { ...process.env, PORT: new URL(url).port },
  });
  assert.equal(stdout.trim(), "ready");
  await assert.rejects(
    execute(process.execPath, ["scripts/healthcheck.mjs"], {
      cwd: root,
      env: { ...process.env, PORT: "1" },
    }),
    (error) => error.code === 1,
  );
});

test("SIGTERM closes the server and exits successfully", async (t) => {
  const child = spawn(process.execPath, ["server.mjs"], {
    cwd: root,
    env: { PATH: process.env.PATH, PORT: "0" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  t.after(() => child.kill("SIGKILL"));
  let output = "";
  const listening = new Promise((resolve, reject) => {
    child.stdout.on("data", (chunk) => {
      output += chunk.toString();
      if (output.includes('"event":"listening"')) resolve();
    });
    child.once("error", reject);
    child.once("exit", () => reject(new Error("Server exited before listening")));
  });
  await listening;
  const exited = once(child, "exit");
  child.kill("SIGTERM");
  const [code, signal] = await exited;
  assert.equal(code, 0);
  assert.equal(signal, null);
  assert.match(output, /"event":"stopped"/);
});

test("SIGUSR2 produces a controlled application failure", async (t) => {
  const child = spawn(process.execPath, ["server.mjs"], {
    cwd: root,
    env: { PATH: process.env.PATH, PORT: "0" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  t.after(() => child.kill("SIGKILL"));
  let errors = "";
  child.stderr.on("data", (chunk) => {
    errors += chunk.toString();
  });
  await new Promise((resolve, reject) => {
    child.stdout.on("data", (chunk) => {
      if (chunk.toString().includes('"event":"listening"')) resolve();
    });
    child.once("error", reject);
    child.once("exit", () => reject(new Error("Server exited before listening")));
  });
  const exited = once(child, "exit");
  child.kill("SIGUSR2");
  const [code, signal] = await exited;
  assert.equal(code, 1);
  assert.equal(signal, null);
  assert.match(errors, /"event":"controlled_failure"/);
});

test("crash command refuses to signal host PID 1", async () => {
  await assert.rejects(
    execute(process.execPath, ["scripts/crash.mjs"], { cwd: root }),
    (error) => error.code === 1 && /Run only inside|PID 1 must run/.test(error.stderr),
  );
});
