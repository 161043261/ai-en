import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      exclude: [
        "coverage/**",
        "dist/**",
        "src/generated/**",
        "src/types/**",
        "**/*.test.ts",
        "**/*.types.ts",
      ],
      include: ["src/**/*.ts", "prisma/**/*.ts"],
      provider: "v8",
      reporter: ["text", "json-summary"],
      reportsDirectory: "coverage",
    },
  },
});
