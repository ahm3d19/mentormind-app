import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: ["./__tests__/setup.ts"],
    coverage: {
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "__tests__/", "src/server.ts"],
    },
  },
  resolve: {
    alias: {
      "@": "./src",
    },
  },
});
