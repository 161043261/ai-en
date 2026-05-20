import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
import { sentryPlugin } from "@lark-sentry/core/vite";

function getManualChunk(id: string) {
  if (!id.includes("node_modules")) return undefined;
  if (id.includes("/@tanstack/react-router/")) return "vendor-router";
  if (id.includes("/react-router")) return "vendor-router";
  if (
    id.includes("/react/") ||
    id.includes("/react-dom/") ||
    id.includes("/scheduler/")
  ) {
    return "vendor-react";
  }
  if (id.includes("/@tanstack/react-query/") || id.includes("/swr/")) {
    return "vendor-data";
  }
  if (id.includes("/zustand/") || id.includes("/jotai/")) return "vendor-state";
  if (id.includes("/lucide-react/")) return "vendor-icons";

  return "vendor";
}

export default defineConfig({
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks: getManualChunk,
      },
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    sentryPlugin({
      url: "/sentry",
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
        // rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  test: {
    environment: "jsdom",
    globals: false,
    setupFiles: ["./src/setup-tests.ts"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },

  // optimizeDeps: {
  //   exclude: ["lark-sentry"],
  // },
});
