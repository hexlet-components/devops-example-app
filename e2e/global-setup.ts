import { spawn, type ChildProcess } from 'node:child_process';

const BASE_URL = 'http://127.0.0.1:4300';
const STARTUP_TIMEOUT_MS = 60_000;
const POLL_INTERVAL_MS = 500;

const sleep = (ms: number) => new Promise((resolve) => {
  setTimeout(resolve, ms);
});

const isAppReady = async () => {
  try {
    const response = await fetch(`${BASE_URL}/`);

    if (!response.ok) {
      return false;
    }

    const body = await response.text();
    return body.includes('Привет от Хекслета!');
  } catch {
    return false;
  }
};

const waitForApp = async () => {
  const startTime = Date.now();

  while ((Date.now() - startTime) < STARTUP_TIMEOUT_MS) {
    if (await isAppReady()) {
      return;
    }

    await sleep(POLL_INTERVAL_MS);
  }

  throw new Error(`App did not become ready in ${STARTUP_TIMEOUT_MS}ms`);
};

export default async () => {
  const serverProcess: ChildProcess = spawn(
    process.execPath,
    ['node_modules/fastify-cli/cli.js', 'start', 'server/plugin.js', '-a', '127.0.0.1', '-p', '4300', '-l', 'info'],
    {
      stdio: 'ignore',
    },
  );

  serverProcess.unref();

  try {
    await waitForApp();
  } catch (error) {
    serverProcess.kill('SIGTERM');
    throw error;
  }

  return async () => {
    if (serverProcess.exitCode !== null || serverProcess.signalCode !== null) {
      return;
    }

    await new Promise<void>((resolve) => {
      const timeout = setTimeout(() => {
        if (serverProcess.exitCode === null && serverProcess.signalCode === null) {
          serverProcess.kill('SIGKILL');
        }

        resolve();
      }, 5_000);

      serverProcess.once('exit', () => {
        clearTimeout(timeout);
        resolve();
      });

      serverProcess.kill('SIGTERM');
    });
  };
};
