const buffers = [];
const mebibyte = 1024 * 1024;
console.log("Allocating up to 256 MiB. Run only in a container with a memory limit.");
const timer = setInterval(() => {
  if (buffers.length < 32) {
    buffers.push(Buffer.alloc(8 * mebibyte, 1));
    console.log(`Allocated ${buffers.length * 8} MiB`);
  }
}, 100);
process.on("SIGTERM", () => {
  clearInterval(timer);
});
