import { existsSync, readFileSync } from "node:fs";

try {
  if (process.platform !== "linux" || !existsSync("/.dockerenv")) {
    throw new Error("Run only inside the Docker course app container");
  }
  const command = readFileSync("/proc/1/cmdline", "utf8").split("\0");
  const isNode = command[0] === "node" || command[0]?.endsWith("/node");
  const isApp = command.some(
    (argument) => argument === "server.mjs" || argument.endsWith("/server.mjs"),
  );
  if (!isNode || !isApp) {
    throw new Error("PID 1 must run the Docker course server.mjs application");
  }
  process.kill(1, "SIGUSR2");
  console.log("Requested controlled application failure");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
