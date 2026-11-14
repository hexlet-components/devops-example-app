import { mkdir, copyFile } from "node:fs/promises";

await mkdir(new URL("../public/", import.meta.url), { recursive: true });
await copyFile(
  new URL("../ui/index.html", import.meta.url),
  new URL("../public/index.html", import.meta.url),
);
console.log("Built public/index.html");
