将旧的 vue3 项目 ./apps/web-old 迁移到新的 react19 项目 ./apps/web

## 迁移方案

- 旧的 vue3 项目类型不严格、缺少 zod schema 校验
- 数据获取没有 swr, 迁移方案: 支持环境变量 SWR_PROVIDER, 值为 swr (使用 [swr](https://swr.vercel.app/docs/getting-started)) 或 tanstack (使用 [@tanstack/react-query](https://tanstack.com/query/latest/docs/framework/react/overview)), 默认值为 swr (使用 swr)
- 组件库 element-plus UI 不美观, 迁移方案: 使用 daisyui
- 图标库 @element-plus/icons-vue 不美观, 迁移方案: 使用 lucide-react
- three.js 模型路径错误, 迁移方案: 使用 ./apps/web/public 下面的正确的模型路径
- 状态管理迁移方案: 支持环境变量 STORE_PROVIDER, 值为 zustand 或 jotai
  - 环境变量 STORE_PROVIDER 值为 zustand 时, 使用 zustand
  - 环境变量 STORE_PROVIDER 值为 jotai 时, 使用 jotai
  - 默认值为 zustand
- router 迁移方案: 支持环境变量 ROUTER_PROVIDER, 值为 react-router 或 tanstack
  - 环境变量 ROUTER_PROVIDER 值为 react-router 时, 使用 react-router、react-router-dom, 使用数据模式
  - 环境变量 ROUTER_PROVIDER 值为 tanstack 时, 使用 [@tanstack/react-router](https://tanstack.com/router/latest/docs/quick-start)
  - 默认值为 react-router
- 样式迁移方案: 统一使用 tailwindcss v4 和 clsx, 不要自定义 CSS 选择器
- 旧的 vue3 项目缺少 XSS 预防
- 旧的 vue3 项目中没有做好文件、目录按职责拆分、有大量中文字符
- 旧的 vue3 项目中缺少测试, 迁移方案: 使用 vitest TDD 测试驱动开发, 或者新增功能后, 补充测试, 保证测试覆盖率
- 新的 react19 项目需要注意 UI 的美观, 你可以使用 animate.css、gasp、daisyui、react-transition-group 等等
- 新的 react19 项目需要有 storybook (storybook、@storybook/react、@storybook/react-vite)
- 新的 react19 项目需要区分好 .env, .env.development, .env.production 等环境变量文件
