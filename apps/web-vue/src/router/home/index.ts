import layout from '@/layout/index.vue'
import Home from '@/pages/home/index.vue'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: layout,
    children: [{ path: '/', component: Home }],
  },
]

export default routes
