import layout from '@/layout/index.vue'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/word-book',
    component: layout,
    children: [
      {
        path: 'index',
        component: () => import('@/pages/word-book/index.vue'),
      },
    ],
  },
]

export default routes
