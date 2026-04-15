import Layout from '@/layout/index.vue'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/settings',
    component: Layout,
    children: [{ path: 'index', component: () => import('@/pages/settings/index.vue') }],
  },
]

export default routes
