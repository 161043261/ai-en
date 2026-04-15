import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { AppConfig } from '@ai-en/common/config'
import tailwindcss from '@tailwindcss/vite'

console.log(globalThis.__APP_CONFIG__)

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    // 5173
    port: AppConfig.ports.webVue,
    proxy: {
      '/api': {
        target: `http://localhost:${AppConfig.ports.server}`,
        changeOrigin: true,
        // secure: false,
        // rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
