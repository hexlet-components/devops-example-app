import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // describe/it/expect без импорта: тесты писались под jest, где эти имена
    // глобальные, и переписывать их ради смены раннера незачем.
    globals: true,
    // Тесты поднимают fastify и бьют в него по очереди, общий инстанс на файл.
    fileParallelism: false,
  },
});
