export const AppConfig = {
  ports: {
    server: 3000,
    webVue: 5173,
    web: 8080,
    minio: 9000,
  },
  hosts: {
    server: "127.0.0.1",
    minio: "127.0.0.1",
  },
};

declare global {
  var __APP_CONFIG__: typeof AppConfig;
}

// globalThis is standard across modern environments (Node, Browser, WebWorker)
if (typeof globalThis !== "undefined") {
  globalThis.__APP_CONFIG__ = AppConfig;
} else {
  // Fallbacks for older environments
  if (typeof global !== "undefined") {
    global.__APP_CONFIG__ = AppConfig;
  } else {
    try {

      // 非严格模式下
      // 全局作用域中的普通函数
      // this 指向全局对象
      const _global = new Function("return this")();
      if (_global) {
        _global.__APP_CONFIG__ = AppConfig;
      }
    } catch (e) {
      // Ignore
    }
  }
}

// pnpm --filter @ai-en/server add "@ai-en/common@workspace:*"
// pnpm --filter @ai-en/web-vue add "@ai-en/common@workspace:*"
// pnpm --filter @ai-en/web add "@ai-en/common@workspace:*"
