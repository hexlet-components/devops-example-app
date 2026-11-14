try {
  const response = await fetch(`http://127.0.0.1:${process.env.PORT || 3000}/ready`, {
    signal: AbortSignal.timeout(2500),
  });
  if (!response.ok) {
    throw new Error(`Readiness returned HTTP ${response.status}`);
  }
  console.log("ready");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
