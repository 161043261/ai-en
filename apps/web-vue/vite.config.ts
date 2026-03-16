import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { config } from '@ai-en/common/config'
import tailwindcss from '@tailwindcss/vite'

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
    port: config.ports.webVue,
    proxy: {
      '/api': {
        target: `http://localhost:${config.ports.main}`,
        changeOrigin: true,
        // secure: false,
        // rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
