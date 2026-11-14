import { createApplication } from "./lib/application.mjs";

try {
  const application = createApplication();
  const port = Number(process.env.PORT || 3000);
  application.server.on("error", (error) => {
    console.error(JSON.stringify({ event: "server_error", code: error.code }));
    process.exit(1);
  });
  application.server.listen(port, "0.0.0.0", () => {
    console.log(JSON.stringify({ event: "listening", port }));
  });
  let stopping = false;
  const stop = async (signal) => {
    if (stopping) {
      return;
    }
    stopping = true;
    console.log(JSON.stringify({ event: "stopping", signal }));
    const timeout = setTimeout(() => process.exit(1), 5000);
    timeout.unref();
    await application.close();
    clearTimeout(timeout);
    console.log(JSON.stringify({ event: "stopped" }));
  };
  process.on("SIGTERM", () => void stop("SIGTERM"));
  process.on("SIGINT", () => void stop("SIGINT"));
  process.on("SIGUSR2", () => {
    console.error(JSON.stringify({ event: "controlled_failure", signal: "SIGUSR2" }));
    process.exit(1);
  });
} catch (error) {
  console.error(JSON.stringify({ event: "configuration_error", message: error.message }));
  process.exitCode = 1;
}
