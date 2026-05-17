// @ts-check

import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig(
  {
    ignores: ["dist/**", "eslint.config.mjs", "src/generated/**"],
  },
  eslint.configs.recommended,
  // tseslint.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
      sourceType: "commonjs",
      parserOptions: {
        project: "./tsconfig.eslint.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
);
