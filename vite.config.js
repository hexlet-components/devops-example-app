// @ts-check

import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    outDir: "dist",
    // Точка входа это css, а не js: своего кода на клиенте у приложения нет.
    // Имя без хеша, потому что шаблон просит файл по имени.
    rollupOptions: {
      input: "src/styles.css",
      output: {
        assetFileNames: "main[extname]",
      },
    },
  },
});
