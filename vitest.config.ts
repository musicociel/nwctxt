import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/**/*.spec.ts"],
    coverage: {
      provider: "istanbul",
      reporter: ["lcov"]
    }
  }
});
